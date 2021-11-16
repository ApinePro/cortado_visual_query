
import {Component, OnInit, ElementRef, Inject} from '@angular/core';
import {ComponentContainer} from 'golden-layout';
import {ColorMapService} from '../../services/colorMapService/color-map.service';
import {SharedDataService} from '../../services/sharedDataService/shared-data.service';
import {BackendService} from '../../services/backendService/backend.service';
import * as dummy_backend_response from './dummy_backend_response.js';
import {LayoutChangeDirective} from '../../directives/layout-change.directive';


@Component({
  selector: 'app-activity-overview',
  templateUrl: './activity-overview.component.html',
  styleUrls: ['./activity-overview.component.css']
})
export class ActivityOverviewComponent extends LayoutChangeDirective implements OnInit {

  constructor(private colorMapService: ColorMapService,
              private sharedDataService: SharedDataService,
              @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken) private container: ComponentContainer,
              elRef: ElementRef) {

    super(elRef.nativeElement);
    const state = this.container.initialState;
  }

  activityColorMap: Map<string, string>;
  activitiesInTree: Set<string> = new Set<string>();
  startActivities: Set<string> = dummy_backend_response.startActivities;
  endActivities: Set<string> = dummy_backend_response.endActivities;
  activitiesInLog: any = dummy_backend_response.activitiesInLog;

  ngOnInit(): void {
    this.colorMapService.colorMap$.subscribe(colorMap => {
      this.activityColorMap = colorMap;
    });

    this.sharedDataService.activitiesInCurrentTree$.subscribe(activitiesInTree => {
      this.activitiesInTree = activitiesInTree;
    });

    this.sharedDataService.loadedEventLog$.subscribe(eventLogName => {
      console.log('new loadedEventLog$ in activity-overview.component:' + eventLogName);
      this.startActivities = this.sharedDataService.startActivitiesInEventLog;
      this.endActivities = this.sharedDataService.endActivitiesInEventLog;
      this.activitiesInLog = this.sharedDataService.activitiesInEventLog;
    });
  }

}

export namespace ActivityOverviewComponent{
  export const componentName = "ActivityOverviewComponent";
}
