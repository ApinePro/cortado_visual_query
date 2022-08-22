export const ZERO_VALUE_COLOR = '#FFFFFF';

export class PerformanceColorMap {
  scale: d3.ScaleThreshold<any, any, any>;

  constructor(scale: d3.ScaleThreshold<any, any, any>) {
    this.scale = scale;
  }

  getColor(value: number) {
    return value < 0.5 ? ZERO_VALUE_COLOR : this.scale(value);
  }

  domain() {
    return this.scale.domain();
  }

  range() {
    return this.scale.range();
  }
}
