import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FilterParams} from "./filter-params";
import {Options} from "ngx-slider-v2";
import {takeUntil} from "rxjs/operators";
import {LogService} from "../../../../services/logService/log.service";
import {Subject} from "rxjs";
import {IDropdownSettings} from "ng-multiselect-dropdown";

// import { } from '@theme/angular/ng-multiselect-dropdown.theme.scss';

@Component({
  selector: 'app-arc-diagram-filter-form',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class ArcDiagramFilterComponent implements OnInit {

  constructor(private logService: LogService) { }

  activityNames: Set<string>;
  @Output()
  filterArcDiagrams = new EventEmitter<FilterParams>();
  private _destroy$ = new Subject();

  sizeRange: RangeFilter = {
    low: 1,
    high: 20,
    options: {
      step: 1,
      floor: 1,
      ceil: 20,
      showTicks: true,
    }
  }

  lengthRange: RangeFilter = {
    ...this.sizeRange,
    low: 1,
    options: {
      ...this.sizeRange.options,
      floor: 1,
    }
  }

  activitiesDropdown = {
    settings: {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    },
    selectedItems: [],
    dropdownList: [],
  }

  model: FilterParams = new FilterParams(this.lengthRange, this.sizeRange, this.activitiesDropdown);

  ngOnInit() {
    this.activitiesDropdown.settings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true,
    }
    this.model = new FilterParams(this.lengthRange, this.sizeRange, this.activitiesDropdown);
    this.logService.activitiesInEventLog$
      .pipe(takeUntil(this._destroy$))
      .subscribe((activities) => {
        this.activityNames = activities;
        this.model.activitiesDropdown.dropdownList = Object.entries(this.activityNames).map(([act, value])=>{
          return { item_id: act, item_text: act }
        })
        this.model.activitiesDropdown.selectedItems = this.model.activitiesDropdown.dropdownList;
      });
  }
  onSubmit() {
    this.filterArcDiagrams.emit(this.model);
  }
}

export class RangeFilter {
  low: number;
  high: number;
  options: Options;
}

class Option {
  item_id: string;
  item_text: string;
}

export class ActivitiesDropdown {
  settings: IDropdownSettings;
  dropdownList: Option[];
  selectedItems: Option[];
}
