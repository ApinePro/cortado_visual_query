import {ActivitiesSelection, MultiRangeFilter} from "./filter.component";

export class FilterParams {

  constructor(
    public lengthRange: MultiRangeFilter,
    public sizeRange: MultiRangeFilter,
    public distanceRange: MultiRangeFilter,
    public activitiesSelection: ActivitiesSelection,
  ) { }

}
