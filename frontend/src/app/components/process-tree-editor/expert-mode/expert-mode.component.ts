import { BackendService } from './../../../services/backendService/backend.service';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import { timeout } from 'd3-timer';

@Component({
  selector: 'app-expert-mode',
  templateUrl: './expert-mode.component.html',
  styleUrls: ['./expert-mode.component.css']
})
export class ExpertModeComponent implements OnInit {

  syntax_tree_string : string = "";
  syntax_status : any;
  @ViewChild('expertModeButton') expertModeButton: ElementRef;

  constructor(private sharedDataService : SharedDataService,
              private backendService : BackendService) {
  }


  ngOnInit() {

  }

  ngAfterViewInit(){

    // If the tree changes and expert mode is open, compute the syntax tree string
    this.sharedDataService.currentDisplayedProcessTree$.subscribe(tree => {
      this.collectCurrentTreeString(tree);
    })
  }

  openExpertMode(){
    this.collectCurrentTreeString(this.sharedDataService.currentTreeString);
  }

  // If expert mode is open, compute the syntax tree string
  private collectCurrentTreeString(tree){

    // TODO make the Expansion check less ugly

    if(this.expertModeButton.nativeElement.ariaExpanded === "true"){
      this.backendService.computeTreeString(tree);
      this.syntax_tree_string = this.sharedDataService.currentTreeString;
      this.syntax_status = null;
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









  //balancedParantheseCheck()





}
