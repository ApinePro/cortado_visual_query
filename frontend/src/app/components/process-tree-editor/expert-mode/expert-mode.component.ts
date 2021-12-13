import { BackendService } from 'src/app/services/backendService/backend.service';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Injectable} from '@angular/core';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators, FormsModule, AsyncValidator, AsyncValidatorFn, AbstractControlOptions, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-expert-mode',
  templateUrl: './expert-mode.component.html',
  styleUrls: ['./expert-mode.component.css']
})
export class ExpertModeComponent implements OnInit, AfterViewInit {

  syntax_tree_string : string = "";
  syntaxTreeInput : any;

  public imbalancedIndex : number;
  @ViewChild('expertModeButton') expertModeButton: ElementRef;


  private currentlyDisplayedTreeInExpertMode;

  constructor(private sharedDataService : SharedDataService,
              private backendService : BackendService) {
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
  }

  onSubmit(){
    console.log(this.syntaxTreeInput);
  }

  get syntax_tree(){
    return this.syntaxTreeInput.get('syntax_tree')!;
  }

  ngAfterViewInit(){

    // If the tree changes and expert mode is open, compute the syntax tree string
    this.sharedDataService.currentDisplayedProcessTree$.subscribe(tree => {
      this.collectCurrentTreeString(tree);
    })

    this.sharedDataService.currentTreeString$.subscribe(treeString => {
      this.syntax_tree_string = treeString;
      this.syntaxTreeInput.get('syntax_tree').setValue(treeString);
    })
  }

  openExpertMode(){
    this.collectCurrentTreeString(this.sharedDataService.currentDisplayedProcessTree);
  }

  // If expert mode is open, compute the syntax tree string
  private collectCurrentTreeString(tree){

    // Check if tree exists, if the expert mode is active and if it did change
    // TODO Currently reruns if the same tree is discovered twice as the object changes
    if(tree && this.expertModeButton.nativeElement.ariaExpanded === "true" && tree !== this.currentlyDisplayedTreeInExpertMode){
      this.backendService.computeTreeString(tree);
      this.currentlyDisplayedTreeInExpertMode = tree;
    }
  }




  /* Checks if a tree_syntax_string is correct using the backend API.
     Stores violations in a displayable syntax_status update         */
  private expert_mode_tree_syntax_check(tree_syntax_string : string) : string{

    return "";
  }

  // Accepts a syntactically correct syntax tree, transforms it into a tree object and stores it in the data service.
  private expert_mode_tree_storage(tree_syntax_string : string){

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
      let re = new RegExp("'([\\w|\\s]+)'", 'g')
      let unknowActivities = new Set();

      const res = control.value.matchAll(re)
      for(let match of res){

        if (!this.sharedDataService.activitiesInEventLog[match[1]]){

          unknowActivities.add({index : match.index, name : match[1]});
        }
      }
      return (unknowActivities.size > 0) ? {unknowActivities : unknowActivities} : null;
    };
  }

}





