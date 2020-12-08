import {Component, OnInit} from '@angular/core';
import {ColorMapService} from "../services/colorMapService/color-map.service";

@Component({
  selector: 'app-activity-overview',
  templateUrl: './activity-overview.component.html',
  styleUrls: ['./activity-overview.component.css']
})
export class ActivityOverviewComponent implements OnInit {

  constructor(private colorMapService: ColorMapService) {
  }

  ngOnInit(): void {
    this.colorMapService.colorMap$.subscribe(colorMap => {
      this.activityColorMap = colorMap;
      console.log(colorMap);
    })
  }

  activityColorMap: Map<string, string>;

}
