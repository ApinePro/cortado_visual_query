import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-color-map',
  templateUrl: './color-map.component.html',
  styleUrls: ['./color-map.component.scss'],
})
export class ColorMapComponent {
  @Input()
  colorMapValues: ColorMapValue[];

  constructor() {}
}

export interface ColorMapValue {
  lowerBound: number;
  color: string;
}

export function buildColorValues(
  colorScale,
  values?: number[]
): ColorMapValue[] {
  let thresholds = colorScale.domain();
  if (values) {
    thresholds = [Math.min(...values), ...thresholds, Math.max(...values)];
  }
  let colors = colorScale.range();
  colors = [...colors, null];
  return thresholds.map((t, i) => {
    return {
      lowerBound: t,
      color: colors[i],
    };
  });
}
