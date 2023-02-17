import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Variant } from 'src/app/objects/Variants/variant';
import { HumanizeDurationPipe } from 'src/app/pipes/humanize-duration.pipe';
import { ModelPerformanceColorScaleService } from 'src/app/services/performance-color-scale.service';
import { PerformanceService } from 'src/app/services/performance.service';
import { textColorForBackgroundColor } from 'src/app/utils/render-utils';

@Component({
  selector: 'app-tree-performance-button',
  templateUrl: './tree-performance-button.component.html',
  styleUrls: ['./tree-performance-button.component.css'],
})
export class TreePerformanceButtonComponent {
  constructor(
    private performanceService: PerformanceService,
    private modelPerformanceColorScaleService: ModelPerformanceColorScaleService
  ) {}

  @Input()
  variant: Variant;

  get isPerformanceActive() {
    return this.performanceService.isTreePerformanceActive(this.variant);
  }

  get isPerformanceCalcInProgress() {
    return this.performanceService.isTreePerformanceCalcInProgress(
      this.variant
    );
  }

  get isPerformanceFitting() {
    return this.performanceService.isTreePerformanceFitting(this.variant);
  }

  toggleTreePerformance() {
    if (this.performanceService.isTreePerformanceActive(this.variant))
      this.performanceService.removeFromTreePerformance(this.variant);
    else this.performanceService.addToTreePerformance(this.variant);
  }

  cancelRequest() {
    this.performanceService.removeFromTreePerformance(this.variant);
  }

  textColorForBackgroundColor(): string {
    const buttonColor = this.computePerformanceButtonColor();
    if (!buttonColor) return 'white';
    return textColorForBackgroundColor(buttonColor);
  }

  get variantFitness(): string {
    return this.performanceService.fitness.get(this.variant)?.toFixed(2);
  }

  get tooltipText(): string {
    const selectedColorScale =
      this.modelPerformanceColorScaleService.selectedColorScale;
    let performance = this.performanceService.variantsTreePerformance.get(
      this.variant
    ).performance[selectedColorScale.performanceIndicator]?.[
      selectedColorScale.statistic
    ];
    if (performance == undefined) {
      performance = 0;
    }
    const humanizedPerf = HumanizeDurationPipe.apply(performance * 1000, {
      round: true,
    });
    return `${selectedColorScale.performanceIndicator} (${selectedColorScale.statistic}): ${humanizedPerf}`;
  }

  computePerformanceButtonColor() {
    if (this.isPerformanceActive) {
      let tree;
      tree = this.performanceService.variantsTreePerformance.get(this.variant);

      if (!tree) {
        return null;
      }

      let selectedScale =
        this.modelPerformanceColorScaleService.selectedColorScale;
      const colorScale = this.modelPerformanceColorScaleService
        .getVariantComparisonColorScale()
        .get(tree.id);
      if (
        colorScale &&
        tree.performance?.[selectedScale.performanceIndicator]?.[
          selectedScale.statistic
        ] !== undefined
      ) {
        return colorScale.getColor(
          tree.performance[selectedScale.performanceIndicator][
            selectedScale.statistic
          ]
        );
      }
    }
    return '#d3d3d3';
  }
}
