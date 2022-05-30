import { ProcessTreeService } from 'src/app/services/processTreeService/process-tree.service';
import { LogService } from 'src/app/services/logService/log.service';
import { BackendService } from 'src/app/services/backendService/backend.service';
import {
  Component,
  OnInit,
  ElementRef,
  Inject,
  Renderer2,
} from '@angular/core';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';
import { ColorMapService } from '../../services/colorMapService/color-map.service';
import { SharedDataService } from '../../services/sharedDataService/shared-data.service';
import { LayoutChangeDirective } from '../../directives/layout-change.directive';
import { DropzoneConfig } from '../drop-zone/drop-zone.component';
import { VariantElement } from '../variant-explorer/model';
import { VariantService } from 'src/app/services/variantService/variant.service';

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
    private logService: LogService,
    private variantService : VariantService,
    private processTreeService : ProcessTreeService,
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
  editingActivityName: boolean = false;

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

    this.processTreeService.activitiesInCurrentTree$.subscribe(
      (activitiesInTree) => {
        this.activitiesInTree = activitiesInTree;
      }
    );

    this.activitiesInLog = this.logService.activitiesInEventLog;
    this.startActivities = this.logService.startActivitiesInEventLog;
    this.endActivities = this.logService.endActivitiesInEventLog;

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
    this.processTreeService.activitiesInCurrentTree$.subscribe(
      (activitiesInTree) => {
        for (let field of this.activityFields) {
          field.inModel = activitiesInTree.has(field.activityName);
        }
      }
    );

    // Handle change of loaded log
    this.logService.loadedEventLog$.subscribe((eventLogName) => {
      console.log(
        'new loadedEventLog$ in activity-overview.component:' + eventLogName
      );

      this.resetActivityFields();
    });
  }

  resetActivityFields() {
    this.startActivities = this.logService.startActivitiesInEventLog;
    this.endActivities = this.logService.endActivitiesInEventLog;
    this.activitiesInLog = this.logService.activitiesInEventLog;

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

  handleVisibilityChange(visibility: boolean): void {}

  handleZIndexChange(
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
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
  deleteActivity(activity: ActivityField) {
    console.log(activity.activityName);
    this.editingActivityName = false;

    this.logService.propagateActivityDeletion(activity.activityName);
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
      Object.keys(this.logService.activitiesInEventLog)
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
        activityField.inputActivityName = activityField.activityName;
      }
    }
  }

  // TODO: refactor this to shared data service
  applyActivityNameChanges(
    oldActivityName: string,
    newActivityName: string
  ): void {
    // build a mapping of old activity name => new activity name
    this.logService.propagateActivityNameChange(
      oldActivityName,
      newActivityName
    );

    let activityNameMapping: Map<string, string> = new Map();
    if (this.activityFields) {
      for (let activityField of this.activityFields) {
        activityNameMapping.set(
          activityField.activityName,
          activityField.activityName
        );
      }
    }

    activityNameMapping.set(oldActivityName, newActivityName);

    // build correct color map
    let newColorMap: Map<string, string> = new Map();
    for (let activityField of this.activityFields) {
      if (activityField.activityName !== oldActivityName) {
        newColorMap.set(activityField.activityName, activityField.color);
      } else {
        newColorMap.set(newActivityName, activityField.color);
      }
    }

    // modifying related data in shared data service. Similar to processEventLog in backend service
    // relabeling activities
    let activities = {};
    for (let activity in this.logService.activitiesInEventLog) {
      let newActivityName = activityNameMapping.get(activity);
      if (!activities[newActivityName]) {
        activities[newActivityName] =
          this.logService.activitiesInEventLog[activity];
      } else {
        activities[newActivityName] +=
          this.logService.activitiesInEventLog[activity];
      }
    }

    // relabeling start activities
    let startActivities = new Set<string>();
    for (let activity of this.logService.startActivitiesInEventLog) {
      startActivities.add(activityNameMapping.get(activity));
    }

    // relabeling end activities
    let endActivities = new Set<string>();
    for (let activity of this.logService.endActivitiesInEventLog) {
      endActivities.add(activityNameMapping.get(activity));
    }

    // defining a function to relabel activities in variant elements recursively
    const relabelVariantRecursive = function (
      mapping: Map<string, string>,
      variant: VariantElement
    ): void {
      if (variant['activity']) {
        variant['activity'] = variant['activity'].map((x) => mapping.get(x));
      } else if (variant['elements']) {
        for (let elem of variant['elements']) {
          relabelVariantRecursive(mapping, elem);
        }
      }
    };

    // relabeling variants
    let variants = this.variantService.variants;
    for (let variantIndex in variants) {
      // relabeling the sub variants
      for (let subVariantIndex in variants[variantIndex]['sub_variants']) {
        let new_variant = [];
        for (let activity of variants[variantIndex]['sub_variants'][
          subVariantIndex
        ]['variant']) {
          new_variant.push([
            [activityNameMapping.get(activity[0][0]), activity[0][1]],
          ]);
        }
        variants[variantIndex]['sub_variants'][subVariantIndex]['variant'] =
          new_variant;
      }
      // relabeling the concurrency group variants
      relabelVariantRecursive(
        activityNameMapping,
        variants[variantIndex]['variant']
      );
    }

    // Apply necessary changes to shared data service
    this.logService.activitiesInEventLog = activities;
    this.logService.startActivitiesInEventLog = startActivities;
    this.logService.endActivitiesInEventLog = endActivities;
    this.colorMapService.colorMap = newColorMap;

    // Changing activity field table
    this.resetActivityFields();
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
