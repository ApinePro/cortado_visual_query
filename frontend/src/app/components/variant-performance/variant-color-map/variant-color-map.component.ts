import { ChangeDetectorRef, Component } from '@angular/core';
import { VariantPerformanceService } from 'src/app/services/variant-performance.service';
import {
  buildColorValues,
  ColorMapValue,
} from '../../performance/color-map/color-map.component';

@Component({
  selector: 'app-variant-color-map',
  templateUrl: './variant-color-map.component.html',
  styleUrls: ['./variant-color-map.component.scss'],
})
export class VariantColorMapComponent {
  availablePerformanceValues = [
    ['Mean', 'mean'],
    ['Minimum', 'min'],
    ['Maximum', 'max'],
    ['Standard Deviation', 'stdev'],
  ];

  public serviceTimeValues: ColorMapValue[];
  public waitingTimeValues: ColorMapValue[];

  constructor(
    public variantPerformanceService: VariantPerformanceService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.variantPerformanceService.serviceTimeColorMap.subscribe((colorMap) => {
      this.updateServiceTimeValues(colorMap);
      changeDetectorRef.markForCheck();
    });

    this.variantPerformanceService.waitingTimeColorMap.subscribe((colorMap) => {
      this.updateWaitingTimeValues(colorMap);
      changeDetectorRef.markForCheck();
    });
  }

  private updateServiceTimeValues(colorMap) {
    this.serviceTimeValues = this.getColorValues(
      colorMap,
      'serviceTime',
      this.variantPerformanceService.serviceTimeStatistic
    );
  }

  private updateWaitingTimeValues(colorMap) {
    this.waitingTimeValues = this.getColorValues(
      colorMap,
      'waitingTime',
      this.variantPerformanceService.waitingTimeStatistic
    );
  }

  private getColorValues(
    colorScale,
    performanceIndicator,
    value
  ): ColorMapValue[] {
    return buildColorValues(colorScale, [
      this.variantPerformanceService.minValues[performanceIndicator],
      this.variantPerformanceService.maxValues[performanceIndicator],
    ]);
  }

  public serviceTimeColorScaleChange(event): void {
    const value = event.target.value;
    this.variantPerformanceService.serviceTimeStatistic = value;
  }

  public waitingTimeColorScaleChange(event): void {
    const value = event.target.value;
    this.variantPerformanceService.waitingTimeStatistic = value;
  }
}
