import { Pair } from '../../directives/arc-diagram/data';
import { FilterParams } from '../../components/variant-explorer/arc-diagram/filter/filter-params';

export class ArcDiagramComputationResult {
  constructor(
    public pairs: PairsPerBid,
    public maximal_values: { size: number; length: number },
    public filterParams: FilterParams,
    public filterAfterComputation: boolean
  ) {}
}

export interface PairsPerBid {
  [bid: string]: Pair[];
}
