import {
  Component,
  OnInit,
  ElementRef,
  Inject,
  Renderer2,
} from '@angular/core';
import { ComponentContainer } from 'golden-layout';
import { ColorMapService } from '../../services/colorMapService/color-map.service';
import { SharedDataService } from '../../services/sharedDataService/shared-data.service';
import { LayoutChangeDirective } from '../../directives/layout-change.directive';
import { DropzoneConfig } from '../drop-zone/drop-zone.component';
import { VariantElement } from '../variant-explorer/model';
import { ProcessTree } from 'src/app/objects/ProcessTree';

@Component({
  selector: 'app-activity-overview',
  templateUrl: './activity-overview.component.html',
  styleUrls: ['./activity-overview.component.scss'],
})
export class ActivityOverviewComponent
  extends LayoutChangeDirective
  implements OnInit
{
  constructor(
    private colorMapService: ColorMapService,
    private sharedDataService: SharedDataService,
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    elRef: ElementRef,
    renderer: Renderer2
  ) {
    super(elRef.nativeElement, renderer);
    const state = this.container.initialState;
  }

  activityColorMap: Map<string, string>;
  activitiesInTree: Set<string> = new Set<string>();
  startActivities: Set<string>;
  endActivities: Set<string>;
  activitiesInLog: any;
  activityFields: ActivityField[];

  sortKey: string = 'activityName';
  ascending: boolean = false;

  activityOverviewOutOfFocus: boolean = false;

  dropZoneConfig: DropzoneConfig;

  ngOnInit(): void {
    this.dropZoneConfig = new DropzoneConfig(
      '.xes',
      'false',
      'false',
      '<large> Import <strong>Event Log</strong> .xes file</large>'
    );

    this.colorMapService.colorMap$.subscribe((colorMap) => {
      this.activityColorMap = colorMap;
    });

    this.sharedDataService.activitiesInCurrentTree$.subscribe(
      (activitiesInTree) => {
        this.activitiesInTree = activitiesInTree;
      }
    );

    this.activitiesInLog = this.sharedDataService.activitiesInEventLog;
    this.startActivities = this.sharedDataService.startActivitiesInEventLog;
    this.endActivities = this.sharedDataService.endActivitiesInEventLog;

    this.activityFields = [];
    for (let activity in this.activitiesInLog) {
      this.activityFields.push(
        new ActivityField(
          activity,
          this.activitiesInLog[activity],
          this.activityColorMap.get(activity),
          this.activitiesInTree.has(activity),
          this.startActivities.has(activity),
          this.endActivities.has(activity)
        )
      );
    }

    // Handle change of current activies in the loaded model
    this.sharedDataService.activitiesInCurrentTree$.subscribe(
      (activitiesInTree) => {
        for (let field of this.activityFields) {
          field.inModel = activitiesInTree.has(field.activityName);
        }
      }
    );

    // Handle change of loaded log
    this.sharedDataService.loadedEventLog$.subscribe((eventLogName) => {
      console.log(
        'new loadedEventLog$ in activity-overview.component:' + eventLogName
      );

      this.resetActivityFields()
    });
  }

  resetActivityFields() {
    this.startActivities = this.sharedDataService.startActivitiesInEventLog;
    this.endActivities = this.sharedDataService.endActivitiesInEventLog;
    this.activitiesInLog = this.sharedDataService.activitiesInEventLog;

    this.activityFields = [];
    for (let activity in this.activitiesInLog) {
      this.activityFields.push(
        new ActivityField(
          activity,
          this.activitiesInLog[activity],
          this.activityColorMap.get(activity),
          this.activitiesInTree.has(activity),
          this.startActivities.has(activity),
          this.endActivities.has(activity)
        )
      );
    }
  }

  toggleBlur(event) {
    this.activityOverviewOutOfFocus = event;
  }

  handleResponsiveChange(
    left: number,
    top: number,
    width: number,
    height: number
  ): void {}

  toggleSort(sortKey: string) {
    // On the first Click always make descending
    if (this.sortKey != sortKey) {
      this.sortKey = sortKey;
      this.ascending = false;
    } else {
      // Make it toggle between on subsequent clicks
      this.ascending = !this.ascending;
    }
  }

  changeActivityColor(activityField: ActivityField, color: string) {
    if (color) {
      activityField.color = color;
      this.colorMapService.changeActivityColor(
        activityField.activityName,
        color
      );
    }
  }

  resetActivityColors(): void {
    this.colorMapService.getColorMap(
      Object.keys(this.sharedDataService.activitiesInEventLog)
    );
    if (this.activityFields) {
      for (let activityField of this.activityFields) {
        activityField.color = this.activityColorMap.get(
          activityField.activityName
        );
      }
    }
  }

  resetActivityNames(): void {
    if (this.activityFields) {
      for (let activityField of this.activityFields) {
        activityField.inputActivityName = activityField.activityName
      }
    }
  }

  applyActivityNameChanges(): void {
    // build a mapping of old activity name => new activity name
    let activityNameChanges: Map<string, string> = new Map()
    if (this.activityFields) {
      for (let activityField of this.activityFields) {
        activityNameChanges.set(activityField.activityName, activityField.inputActivityName)
      }
    }

    // build correct color map
    let newColorMap: Map<string, string> = new Map()
    for (let activityField of this.activityFields) {
      newColorMap.set(activityField.inputActivityName, activityField.color)
    }

    // modifying related data in shared data service. Similar to processEventLog in backend service
    // relabeling activities
    let activities = {}
    for (let activity in this.sharedDataService.activitiesInEventLog) {
      let newActivityName = activityNameChanges.get(activity)
      if(!activities[newActivityName]){
        activities[newActivityName] = this.sharedDataService.activitiesInEventLog[activity]
      } else {
        activities[newActivityName] += this.sharedDataService.activitiesInEventLog[activity]
      }
    }
    
    // relabeling start activities
    let startActivities = new Set<string>()
    for (let activity of this.sharedDataService.startActivitiesInEventLog) {
      startActivities.add(activityNameChanges.get(activity)) 
    }
    
    // relabeling end activities
    let endActivities = new Set<string>()
    for (let activity of this.sharedDataService.endActivitiesInEventLog) {
      endActivities.add(activityNameChanges.get(activity)) 
    }
    
    // relabeling process tree
    if(this.sharedDataService.currentDisplayedProcessTree){
      this.sharedDataService.relabelProcessTree(activityNameChanges)
    }

    // defining a function to relabel activities in variant elements recursively
    const relabelVariantRecursive = function(variant: VariantElement) {
      if (variant['activity']) {
        variant['activity'] = variant['activity'].map(x => activityNameChanges.get(x));
      } else if (variant['elements']) {
        for (let elem of variant['elements']){
          relabelVariantRecursive(elem)
        }
      }
    }

    // relabeling variants
    let variants = this.sharedDataService.variants
    for (let variantIndex in variants) {
      // relabeling the sub variants
      for (let subVariantIndex in variants[variantIndex]['sub_variants']) {
        let new_variant = []
        for (let activity of variants[variantIndex]['sub_variants'][subVariantIndex]['variant']) {
          new_variant.push([[activityNameChanges.get(activity[0][0]), activity[0][1]]])
        }
        variants[variantIndex]['sub_variants'][subVariantIndex]['variant'] = new_variant
      }
      // relabeling the concurrency group variants
      relabelVariantRecursive(variants[variantIndex]['variant'])
    }

    // Apply necessary changes to shared data service
    this.sharedDataService.activitiesInEventLog = activities;
    this.sharedDataService.startActivitiesInEventLog = startActivities;
    this.sharedDataService.endActivitiesInEventLog = endActivities;
    this.sharedDataService.activityNamesChanged += "#";
    this.colorMapService.colorMap = newColorMap;

    // Changing activity field table
    this.resetActivityFields()
  }
  
}

export class ActivityField {
  activityName: string;
  occurences: number;
  inModel: boolean;
  isStart: boolean;
  isEnd: boolean;
  color: string;
  inputActivityName: string; // Storing the input name from user

  constructor(
    activityName: string,
    occurences: number,
    color: string,
    inModel: boolean,
    isStart: boolean,
    isEnd: boolean
  ) {
    this.activityName = activityName;
    this.occurences = occurences;
    this.inModel = inModel;
    this.isStart = isStart;
    this.isEnd = isEnd;
    this.color = color;
    this.inputActivityName = activityName;
  }
}

export namespace ActivityOverviewComponent {
  export const componentName = 'ActivityOverviewComponent';
}
