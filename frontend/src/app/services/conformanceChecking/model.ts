export class ConformanceCheckingResult {
  isTimeout: boolean;
  cost: number;
  deviation: boolean;

  constructor(isTimeout: boolean, cost: number, deviation: boolean) {
    this.isTimeout = isTimeout;
    this.cost = cost;
    this.deviation = deviation;
  }
}
