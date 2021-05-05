import {Component, OnInit} from '@angular/core';
import {ColorMapService} from '../../services/colorMapService/color-map.service';
import {SharedDataService} from '../../services/sharedDataService/shared-data.service';
import {BackendService} from '../../services/backendService/backend.service';

@Component({
  selector: 'app-activity-overview',
  templateUrl: './activity-overview.component.html',
  styleUrls: ['./activity-overview.component.css']
})
export class ActivityOverviewComponent implements OnInit {

  constructor(private colorMapService: ColorMapService,
              private sharedDataService: SharedDataService,
              private backendService: BackendService) {
  }

  activityColorMap: Map<string, string>;
  activitiesInTree: Set<string> = new Set<string>();
  startActivities: Set<string> = new Set<string>();
  endActivities: Set<string> = new Set<string>();
  activitiesInLog: any = {};

  ngOnInit(): void {
    this.colorMapService.colorMap$.subscribe(colorMap => {
      this.activityColorMap = colorMap;
    });

    this.sharedDataService.activitiesInCurrentTree$.subscribe(activitiesInTree => {
      this.activitiesInTree = activitiesInTree;
    });

    this.sharedDataService.loadedEventLog$.subscribe(eventLogName => {
      this.backendService.getStartActivitiesFromEventLog().subscribe(res => {
        this.startActivities = new Set(Object.keys(res));
      });
      this.backendService.getEndActivitiesFromEventLog().subscribe(res => {
        this.endActivities = new Set(Object.keys(res));
      });
      this.backendService.getActivitiesFromEventLog().subscribe(res => {
        this.activitiesInLog = res;
      });
    });
  }

}
