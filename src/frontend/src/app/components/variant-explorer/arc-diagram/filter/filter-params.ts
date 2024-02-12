import {ActivitiesDropdown, RangeFilter} from "./filter.component";

export class FilterParams {

  constructor(
    public lengthRange: RangeFilter,
    public sizeRange: RangeFilter,
    public activitiesDropdown: ActivitiesDropdown,
  ) { }

}
