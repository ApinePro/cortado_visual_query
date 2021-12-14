import { BackendService } from 'src/app/services/backendService/backend.service';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Injectable, Renderer2 as Renderer } from '@angular/core';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators, FormsModule, AsyncValidator, AsyncValidatorFn, AbstractControlOptions, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';

@Component({
  selector: 'app-expert-mode',
  templateUrl: './expert-mode.component.html',
  styleUrls: ['./expert-mode.component.css']
})
export class ExpertModeComponent implements OnInit, AfterViewInit {

  syntax_tree_string : string = "";

  syntaxTreeInput : any;
  edit : boolean = false;

  activityNameRegEx = new RegExp("'([^']+)'", 'g');

  activityColorMap: Map<string, string>;

  public imbalancedIndex : number;
  @ViewChild('expertModeButton') expertModeButton: ElementRef;
  @ViewChild('styledText') styledTextDiv : ElementRef<HTMLDivElement>;
  @ViewChild('textEditor') textEditor : ElementRef<HTMLDivElement>;


  private currentlyDisplayedTreeInExpertMode;

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
                  this.balancedParantheseValidator(),
                  this.unknownActivityNameValidator(),
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

    })

    return value

  }


  strip_html(value: any): string {
    const regex = new RegExp("<[^>]*>", "g")
    value = value.replaceAll(regex, "");

    return value
  }

  onSubmit(){
    console.log(this.syntaxTreeInput);
    console.log(this.strip_html(this.syntax_tree.value));

    this.backendService.renderStringToPT(this.strip_html(this.syntax_tree.value));
  }

  get syntax_tree() : FormControl{
    return this.syntaxTreeInput.get('syntax_tree')!;
  }

  ngAfterViewInit(){

    // If the tree changes and expert mode is open, compute the syntax tree string
    this.sharedDataService.currentDisplayedProcessTree$.subscribe(tree => {
      console.log("Tree Changed")
      this.collectCurrentTreeString(tree);
    })

    this.sharedDataService.currentTreeString$.subscribe(treeString => {
      this.syntax_tree.setValue(treeString);
      this.styleText();
    })

    this.syntax_tree.setValue("'A_SUBMITTED'")
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

  balancedParantheseValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const forbidden = true;

      let stack = [];
      let imbalanced = false;
      this.imbalancedIndex = null;

      for (let i = 0; i < control.value.length; i++){
        switch(control.value[i]){
          case("("): stack.push("("); break;
          case(")"): if(stack.pop() !== "("){imbalanced = true; this.imbalancedIndex = i;}; break;
          case("{"): stack.push("{"); break;
          case("}"): if(stack.pop() !== "{"){imbalanced = true; this.imbalancedIndex = i;}; break;
          case("["): stack.push("["); break;
          case("]"): if(stack.pop() !== "["){imbalanced = true; this.imbalancedIndex = i;}; break;
          default: continue;
        }

        if(imbalanced){
          break;
        }
      }

      if(stack.length > 0){
        imbalanced = true;
        this.imbalancedIndex = control.value.length;
      }

      return imbalanced ? {imbalanced : this.imbalancedIndex} : null;
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

}





