import {Component} from '@angular/core';
import {FilterParams} from "./filter-params";

@Component({
  selector: 'app-arc-diagram-filter-form',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class ArcDiagramFilterComponent {

  model = new FilterParams(20,1);
}
