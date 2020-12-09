import {Component, OnInit} from '@angular/core';
import {ColorMapService} from "../services/colorMapService/color-map.service";
import {SharedDataService} from "../services/sharedDataService/shared-data.service";

@Component({
  selector: 'app-activity-overview',
  templateUrl: './activity-overview.component.html',
  styleUrls: ['./activity-overview.component.css']
})
export class ActivityOverviewComponent implements OnInit {

  constructor(private colorMapService: ColorMapService, private sharedDataService: SharedDataService) {
  }

  ngOnInit(): void {
    this.colorMapService.colorMap$.subscribe(colorMap => {
      this.activityColorMap = colorMap;
      console.log(colorMap);
    });

    this.sharedDataService.activitiesInCurrentTree$.subscribe(activitiesInTree => {
      this.activitiesInTree = activitiesInTree;
    })
  }

  activityColorMap: Map<string, string>;
  activitiesInTree: Set<string> = new Set();

}
