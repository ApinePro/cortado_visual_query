import {Component, OnInit} from '@angular/core';
import {ColorMapService} from '../../services/colorMapService/color-map.service';
import {SharedDataService} from '../../services/sharedDataService/shared-data.service';

@Component({
  selector: 'app-activity-overview',
  templateUrl: './activity-overview.component.html',
  styleUrls: ['./activity-overview.component.css']
})
export class ActivityOverviewComponent implements OnInit {

  constructor(private colorMapService: ColorMapService,
              private sharedDataService: SharedDataService) {
  }

  activityColorMap: Map<string, string>;
  activitiesInTree: Set<string> = new Set<string>();
  startActivities: Set<string>;
  endActivities: Set<string>;
  activitiesInLog: any;

  ngOnInit(): void {
    this.colorMapService.colorMap$.subscribe(colorMap => {
      this.activityColorMap = colorMap;
    });

    this.sharedDataService.activitiesInCurrentTree$.subscribe(activitiesInTree => {
      this.activitiesInTree = activitiesInTree;
    });

    this.activitiesInLog = this.sharedDataService.activitiesInEventLog;
    this.startActivities = this.sharedDataService.startActivitiesInEventLog;
    this.endActivities = this.sharedDataService.endActivitiesInEventLog;

    this.sharedDataService.loadedEventLog$.subscribe(eventLogName => {
      console.log('new loadedEventLog$ in activity-overview.component:' + eventLogName);
      this.startActivities = this.sharedDataService.startActivitiesInEventLog;
      this.endActivities = this.sharedDataService.endActivitiesInEventLog;
      this.activitiesInLog = this.sharedDataService.activitiesInEventLog;
    });
  }

}
