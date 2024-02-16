import {ActivitiesDropdown, MultiRangeFilter, SingleRangeFilter} from "./filter.component";

export class FilterParams {

  constructor(
    public lengthRange: MultiRangeFilter,
    public sizeRange: MultiRangeFilter,
    public distanceRange: SingleRangeFilter,
    public activitiesDropdown: ActivitiesDropdown,
  ) { }

}
