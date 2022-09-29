export class ConformanceCheckingResult {
  id: string;
  type: number;
  isTimeout: boolean;
  cost: number;
  deviations: number;
  alignment: string;

  constructor(
    id: string,
    type: number,
    isTimeout: boolean,
    cost: number,
    deviations: number,
    alignment: string
  ) {
    this.id = id;
    this.type = type;
    this.isTimeout = isTimeout;
    this.cost = cost;
    this.deviations = deviations;
    this.alignment = alignment;
  }
}
