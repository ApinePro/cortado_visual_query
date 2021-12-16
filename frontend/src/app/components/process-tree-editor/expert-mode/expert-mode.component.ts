import { BackendService } from 'src/app/services/backendService/backend.service';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Renderer2 as Renderer } from '@angular/core';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';
import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';

@Component({
  selector: 'app-expert-mode',
  templateUrl: './expert-mode.component.html',
  styleUrls: ['./expert-mode.component.scss']
})
export class ExpertModeComponent implements OnInit, AfterViewInit {

  syntax_tree_string : string = "";
  syntaxTreeInput : any;
  edit : boolean = false;
  allowRender : boolean =  true;
  activityNameRegEx = new RegExp("'([^']*)'", 'g');

  activityColorMap: Map<string, string>;
  imbalancedItems : Array<imbalancedItem>;

  @ViewChild('expertModeButton') expertModeButton: ElementRef;
  @ViewChild('styledText') styledTextDiv : ElementRef<HTMLDivElement>;
  @ViewChild('textEditor') textEditor : ElementRef<HTMLDivElement>;


  currentlyDisplayedTreeInExpertMode;

  constructor(private sharedDataService : SharedDataService,
              private backendService : BackendService,
              private colorMapService : ColorMapService,
              private renderer : Renderer) {
  }

  ngOnInit() {
    this.syntaxTreeInput = new FormGroup({
      syntax_tree: new FormControl('',
              {
                validators : [
                  this.balancedParenthesisValidator(),
                  this.unknownActivityNameValidator(),
                  this.balancedApostropheValidator()
                 ],
                updateOn : 'change',
              })
    });



    /* Handling the styling as the input changes, currently problematic due to issues with input cursor tracking

    this.syntax_tree.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(res => {
                        res = this.strip_html(res);
                        this.syntax_tree.setValue(res, {emitEvent : false});
    })
    */

    this.colorMapService.colorMap$.subscribe(colorMap => {
      this.activityColorMap = colorMap;
    });

  }

  openEditor(){
    this.edit = true;
    setTimeout(() => {
      this.textEditor.nativeElement.focus();
    }, 5);
  }


  styleText(){
    let value = this.syntax_tree.value
    this.edit = false;
    value = this.highlightImbalancedParenthesis(value);
    value = this.colorActivityNames(value);

    // This presents a possible vulnerability for remote code execution, add sanitisation or change input mode, when this presents a serious issue.
    this.renderer.setProperty(this.styledTextDiv.nativeElement, 'innerHTML', value);
  }


  colorActivityNames(value: any): string {
    const matches = value.matchAll(this.activityNameRegEx);
    const activities = new Map<string, string>();
    let knownActivities = new Set();
    let unknowActivities = new Set();

    for(let match of matches){
      if (this.activityColorMap.has(match[1])){
        knownActivities.add(match[1]);
      }else{
        unknowActivities.add(match[1]);
      }
    }

    value = value.replaceAll("*tau*", "<b>*tau*</b>")

    knownActivities.forEach((activityName : string) => {
      value = value.replaceAll(activityName, `<b><span style="color:${this.activityColorMap.get(activityName)}">`+ activityName+'</span></b>')
    })

    unknowActivities.forEach((activityName : string) => {
      value = value.replaceAll("'" + activityName + "'", "'<span class=\"warning-highlight\">" + activityName + "</span>'")
    })

    return value

  }


  highlightImbalancedParenthesis(value: any){

    let runningOffset = 0;

    if(this.imbalancedItems && this.imbalancedItems.length > 0){
      this.imbalancedItems.sort((a,b) => a.index - b.index)

      for(let imbalancedItem of this.imbalancedItems){
        const highlightedPara = '<span class="imbalanced-parenthesis">'+ imbalancedItem.symbol + '</span>'
        value = value.slice(0, imbalancedItem.index + runningOffset) + highlightedPara + value.slice(imbalancedItem.index + runningOffset + 1, value.length)
        runningOffset += highlightedPara.length - 1;
      }

    }

    return value;
  }

  strip_html(value: any): string {
    const regex = new RegExp("<[^>]*>", "g")
    value = value.replaceAll(regex, "");
    return value
  }

  onSubmit(){
    this.allowRender = false;
    let treeString = this.syntax_tree.value;
    console.log(treeString);
    treeString = this.strip_html(treeString);
    console.log("After Processing", treeString);

    const $pendingTreeParse = this.backendService.renderStringToPT(treeString);

    $pendingTreeParse.subscribe((result : any )=> {
      if(!result.error){
        this.sharedDataService.currentDisplayedProcessTree = result.tree;
      } else {
        this.sharedDataService.currentTreeStringSyntaxCheck = result.error;
      }
      this.allowRender = true;
    });


  }


  replaceRichTextPlaceholderChars(treeString: string): string {
    const richTextChar = new RegExp("&[\\w]+;", 'g');

    // Replace the &gt with >
    treeString = treeString.replace('&gt;', '>')

    // Remove all the unknown richTextChars
    treeString = treeString.replace(richTextChar, '')
    return treeString;
  }

  get syntax_tree() : FormControl{
    return this.syntaxTreeInput.get('syntax_tree')!;
  }

  ngAfterViewInit(){

    // If the tree changes and expert mode is open, compute the syntax tree string
    this.sharedDataService.currentDisplayedProcessTree$.subscribe(tree => {
      this.collectCurrentTreeString(tree);
    })

    this.sharedDataService.currentTreeString$.subscribe(treeString => {
      this.syntax_tree.setValue(treeString);
      this.styleText();
    })
  }

  openExpertMode(){
    this.collectCurrentTreeString(this.sharedDataService.currentDisplayedProcessTree);
  }

  // If expert mode is open, compute the syntax tree string
  private collectCurrentTreeString(tree){

    // Check if tree exists, if the expert mode is active and if it did change
    if(tree && this.expertModeButton.nativeElement.ariaExpanded === "true" && tree !== this.currentlyDisplayedTreeInExpertMode){
      this.backendService.computeTreeString(tree);
      this.currentlyDisplayedTreeInExpertMode = tree;
    }
  }


  balancedParenthesisValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      let stack = new Array<imbalancedItem>();
      let imbalanced = false;

      let imbalancedItems = new Array<imbalancedItem>();

      const popStack = function(checkSymbol : string, index : number, expected : string){
        let item = stack.pop();

        // If we have a mismatch, add it to the imbalanced Items
        if(item && item.symbol !== checkSymbol){
          imbalancedItems.push(item);
          imbalanced = true;

        // If the stack is already empty we get a mismatch
        } else if (!item){
          imbalancedItems.push(new imbalancedItem(expected, index));
          imbalanced = true;
        }
      }

      for (let i = 0; i < control.value.length; i++){
        switch(control.value[i]){
          case("("): stack.push(new imbalancedItem("(", i)); break;
          case(")"): popStack("(", i, ")"); break;
          case("{"): stack.push(new imbalancedItem("{", i)); break;
          case("}"): popStack("{", i, "}"); break;
          case("["): stack.push(new imbalancedItem("[", i)); break;
          case("]"): popStack("[", i, "]"); break;
          default: continue;
        }
      }

      if(stack.length > 0){
        imbalancedItems.push(...stack);
        imbalanced = true;
      }

      this.imbalancedItems = imbalancedItems;

      return imbalanced ? {imbalanced : imbalancedItems} : null;
    };
  }



  unknownActivityNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      //Quick regExp that matches all chars incl. whitespace between two ' '

      let unknowActivities = new Set();

      const res = control.value.matchAll(this.activityNameRegEx)
      for(let match of res){

        if (!this.sharedDataService.activitiesInEventLog[match[1]]){
          unknowActivities.add({index : match.index, name : match[1]});
        }
      }
      return (unknowActivities.size > 0) ? {unknowActivities : unknowActivities} : null;
    };
  }

  balancedApostropheValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let occurences = 0

      if(control.value){
        occurences = control.value.match(/'/g || []).length
      }

      return (occurences % 2) === 1 ?{apostrophe : true}: null;
    };
  }

}

class imbalancedItem{
  symbol: string;
  index : number;

  constructor(symbol: string, index : number){
    this.symbol = symbol;
    this.index = index;
  }
}





