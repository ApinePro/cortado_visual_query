import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FilterParams} from "./filter-params";
import {Options} from "ngx-slider-v2";
import {takeUntil} from "rxjs/operators";
import {LogService} from "../../../../services/logService/log.service";
import {Subject} from "rxjs";
import {ColorMapService} from "../../../../services/colorMapService/color-map.service";
import {textColorForBackgroundColor} from "../../../../utils/render-utils";

// import { } from '@theme/angular/ng-multiselect-dropdown.theme.scss';

@Component({
  selector: 'app-arc-diagram-filter-form',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class ArcDiagramFilterComponent implements OnInit {

  constructor(private logService: LogService, private colorMapService: ColorMapService) { }

  activityNames: Set<string>;
  colorMap: Map<string, string> = new Map<string, string>();
  @Output()
  filterArcDiagrams = new EventEmitter<FilterParams>();

  @Input() set arcsMaxValues(values: MaxValues) {
    for(const [type, value] of Object.entries(values)) {
      this.setRangeFilters(type, value);
    }
  }

  private _destroy$ = new Subject();

  distance: SingleRangeFilter = {
    low: 0,
    options: {
      step: 1,
      floor: 0,
      ceil: 20,
      showTicks: true,
    }
  }

  sizeRange: MultiRangeFilter = {
    ...this.distance,
    low: 1,
    high: 2,
    options: {
      ...this.distance.options,
      floor: 1,
      ceil: 2,
    }
  }

  lengthRange: MultiRangeFilter =  {
    ...this.sizeRange
  }

  activitiesDropdown = {
    selectedItems: [],
    dropdownList: [],
  }

  model: FilterParams = new FilterParams(this.lengthRange, this.sizeRange, this.distance, this.activitiesDropdown);

  ngOnInit() {
    this.logService.activitiesInEventLog$
      .pipe(takeUntil(this._destroy$))
      .subscribe((activities) => {
        this.activityNames = activities;
        Object.entries(this.activityNames).forEach(([activity,], idx) => {
          this.model.activitiesDropdown.dropdownList[idx] = activity
          this.model.activitiesDropdown.dropdownList = this.model.activitiesDropdown.dropdownList.sort()
          this.model.activitiesDropdown.selectedItems = this.model.activitiesDropdown.dropdownList;
        });
      });
    this.colorMapService.colorMap$
      .pipe(takeUntil(this._destroy$))
      .subscribe((map) => {
        this.colorMap = map;
      });
  }
  createNewOptionsObject(rangeFilter: Options, value: number) {
    const newOptions: Options = Object.assign({}, rangeFilter);
    newOptions.ceil = value + 1;
    return newOptions;
  }

  setRangeFilters(type: string, value: number) {
    this.model[`${type}Range`].high = value + 1;
    this.model[`${type}Range`].options = this.createNewOptionsObject(this.model[`${type}Range`].options, value);
  }
  onSubmit() {
    this.filterArcDiagrams.emit(this.model);
  }

  resetActivitiesSelection() {
    this.model.activitiesDropdown.selectedItems = [];
  }

  protected readonly textColorForBackgroundColor = textColorForBackgroundColor;
}

export class MultiRangeFilter {
  low: number;
  high: number;
  options: Options;
}

export class SingleRangeFilter {
  low: number;
  options: Options;
}

export class ActivitiesDropdown {
  dropdownList: string[];
  selectedItems: string[];
}

export class MaxValues {
  size: number;
  length: number;
  distance: number;
}
