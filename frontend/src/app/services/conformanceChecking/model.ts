export class ConformanceCheckingResult {
  id: string;
  type : number;
  isTimeout: boolean;
  cost: number;
  deviation: boolean;

  constructor(
    id: string,
    type : number,
    isTimeout: boolean,
    cost: number,
    deviation: boolean
  ) {
    this.id = id;
    this.type = type;
    this.isTimeout = isTimeout;
    this.cost = cost;
    this.deviation = deviation;
  }
}
