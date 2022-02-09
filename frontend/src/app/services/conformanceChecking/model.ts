export class ConformanceCheckingResult {
  id: string;
  isTimeout: boolean;
  cost: number;
  deviation: boolean;

  constructor(
    id: string,
    isTimeout: boolean,
    cost: number,
    deviation: boolean
  ) {
    this.id = id;
    this.isTimeout = isTimeout;
    this.cost = cost;
    this.deviation = deviation;
  }
}
