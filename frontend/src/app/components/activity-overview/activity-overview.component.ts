
import {Component, OnInit, ElementRef, Inject, Renderer2} from '@angular/core';
import {ComponentContainer} from 'golden-layout';
import {ColorMapService} from '../../services/colorMapService/color-map.service';
import {SharedDataService} from '../../services/sharedDataService/shared-data.service';
import {LayoutChangeDirective} from '../../directives/layout-change.directive';
import {DropzoneConfig} from '../drop-zone/drop-zone.component';


@Component({
  selector: 'app-activity-overview',
  templateUrl: './activity-overview.component.html',
  styleUrls: ['./activity-overview.component.scss']
})
export class ActivityOverviewComponent extends LayoutChangeDirective implements OnInit {

  constructor(private colorMapService: ColorMapService,
              private sharedDataService: SharedDataService,
              @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken) private container: ComponentContainer,
              elRef: ElementRef,
              renderer : Renderer2) {

    super(elRef.nativeElement, renderer);
    const state = this.container.initialState;
  }

  activityColorMap: Map<string, string>;
  activitiesInTree: Set<string> = new Set<string>();
  startActivities: Set<string>;
  endActivities: Set<string>;
  activitiesInLog: any;
  activityFields: ActivityField[];

  sortKey : string = "activityName";
  ascending : boolean = false;

  activityOverviewOutOfFocus : boolean = false;

  dropZoneConfig : DropzoneConfig;

  ngOnInit(): void {

    this.dropZoneConfig = new DropzoneConfig(
      ".xes",
      "false",
      "false",
      "<large> Import <strong>Event Log</strong> .xes file</large>"
    )

    this.colorMapService.colorMap$.subscribe(colorMap => {
      this.activityColorMap = colorMap;
    });

    this.sharedDataService.activitiesInCurrentTree$.subscribe(activitiesInTree => {
      this.activitiesInTree = activitiesInTree;
    });

    this.activitiesInLog = this.sharedDataService.activitiesInEventLog;
    this.startActivities = this.sharedDataService.startActivitiesInEventLog;
    this.endActivities = this.sharedDataService.endActivitiesInEventLog;

    this.activityFields = [];
    for (let activity in this.activitiesInLog) {
      this.activityFields.push(new ActivityField(activity,
                                                 this.activitiesInLog[activity],
                                                 this.activityColorMap.get(activity),
                                                 this.activitiesInTree.has(activity),
                                                 this.startActivities.has(activity),
                                                 this.endActivities.has(activity)));

    }

    // Handle change of current activies in the loaded model
    this.sharedDataService.activitiesInCurrentTree$.subscribe(activitiesInTree => {
      for (let field of this.activityFields){
        field.inModel = activitiesInTree.has(field.activityName);
      }
    })

    // Handle change of loaded log
    this.sharedDataService.loadedEventLog$.subscribe(eventLogName => {
      console.log('new loadedEventLog$ in activity-overview.component:' + eventLogName);

      this.startActivities = this.sharedDataService.startActivitiesInEventLog;
      this.endActivities = this.sharedDataService.endActivitiesInEventLog;
      this.activitiesInLog = this.sharedDataService.activitiesInEventLog;

      this.activityFields = [];
      for (let activity in this.activitiesInLog) {
        this.activityFields.push(new ActivityField(activity,
                                                   this.activitiesInLog[activity],
                                                   this.activityColorMap.get(activity),
                                                   this.activitiesInTree.has(activity),
                                                   this.startActivities.has(activity),
                                                   this.endActivities.has(activity)));
      }

    });
  }

  toggleBlur(event){
    this.activityOverviewOutOfFocus = event;
  }

  handleResponsiveChange(left: number, top: number, width: number, height: number) : void{
  };

  toggleSort(sortKey : string){

    // On the first Click always make descending
    if(this.sortKey != sortKey){
      this.sortKey = sortKey;
      this.ascending = false;
    }else{
      // Make it toggle between on subsequent clicks
      this.ascending = !this.ascending;
    }
  }
}

export class ActivityField {
    activityName : string;
    occurences : number;
    inModel : boolean;
    isStart : boolean;
    isEnd : boolean;
    color : string;

    constructor(activityName : string,
                  occurences : number,
                  color : string,
                  inModel : boolean,
                  isStart : boolean,
                  isEnd : boolean){

        this.activityName =  activityName;
        this.occurences = occurences;
        this.inModel = inModel;
        this.isStart = isStart;
        this.isEnd = isEnd;
        this.color = color;
    }
}


export namespace ActivityOverviewComponent{
  export const componentName = "ActivityOverviewComponent";
}
