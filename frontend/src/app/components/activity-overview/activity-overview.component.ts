import { ProcessTreeService } from 'src/app/services/processTreeService/process-tree.service';
import { LogService } from 'src/app/services/logService/log.service';
import { BackendService } from 'src/app/services/backendService/backend.service';
import {
  Component,
  OnInit,
  ElementRef,
  Inject,
  Renderer2,
  AfterViewInit,
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
  implements OnInit, AfterViewInit
{
  constructor(
    private colorMapService: ColorMapService,
    private sharedDataService: SharedDataService,
    private logService: LogService,
    private variantService: VariantService,
    private processTreeService: ProcessTreeService,
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

    this.activityFields = [];

    // Handle change of loaded log
    this.logService.loadedEventLog$.subscribe((eventLogName) => {
      console.log(
        'new loadedEventLog$ in activity-overview.component:' + eventLogName
      );

      this.resetActivityFields();
    });
  }

  ngAfterViewInit(): void {
    this.colorMapService.colorMap$.subscribe((colorMap) => {
      this.activityColorMap = colorMap;

      if (this.activityFields) {
        for (let activityField of this.activityFields) {
          activityField.color = this.activityColorMap.get(
            activityField.activityName
          );
        }
      }

      console.log('Got new ColorMap', colorMap);
    });

    // Handle change of current activies in the loaded model
    this.processTreeService.activitiesInCurrentTree$.subscribe(
      (activitiesInTree) => {
        for (let field of this.activityFields) {
          field.inModel = activitiesInTree.has(field.activityName);
        }

        console.log('Activiites in Tree', activitiesInTree);
      }
    );

    this.logService.startActivitiesInEventLog$.subscribe(() => {
      if (this.activityColorMap) {
        this.resetActivityFields();
      }
    });
  }

  resetActivityFields() {
    this.startActivities = this.logService.startActivitiesInEventLog;
    this.endActivities = this.logService.endActivitiesInEventLog;
    this.activitiesInLog = this.logService.activitiesInEventLog;
    this.activitiesInTree = this.processTreeService.activitiesInCurrentTree;

    console.log(this.activitiesInTree);

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
    this.variantService.deleteActivity(activity.activityName);
    this.resetActivityFields();
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
    this.colorMapService.createColorMap(
      Object.keys(this.logService.activitiesInEventLog)
    );
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
    console.log(oldActivityName, newActivityName);
    this.variantService.renameActivity(oldActivityName, newActivityName);

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
