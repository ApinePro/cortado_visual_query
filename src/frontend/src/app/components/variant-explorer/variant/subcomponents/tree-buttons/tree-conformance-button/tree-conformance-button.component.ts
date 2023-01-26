import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ProcessTree } from 'src/app/objects/ProcessTree/ProcessTree';
import { Variant } from 'src/app/objects/Variants/variant';
import { ConformanceCheckingService } from 'src/app/services/conformanceChecking/conformance-checking.service';
import { textColorForBackgroundColor } from 'src/app/utils/render-utils';

@Component({
  selector: 'app-tree-conformance-button',
  templateUrl: './tree-conformance-button.component.html',
  styleUrls: ['./tree-conformance-button.component.css'],
})
export class TreeConformanceButtonComponent {
  @Input()
  variant: Variant;

  constructor(public conformanceCheckingService: ConformanceCheckingService) {}

  toggleTreeConformance() {
    if (this.conformanceCheckingService.isTreeConformanceActive(this.variant))
      this.conformanceCheckingService.removeFromTreeConformance(this.variant);
    else this.conformanceCheckingService.addToTreeConformance(this.variant);
  }

  computeConformanceButtonColor() {
    if (this.conformanceValue)
      return this.conformanceCheckingService.conformanceColorMap.getColor(
        this.conformanceValue
      );
    else return 'white';
  }

  computeConformanceButtonTextColor() {
    const buttonColor = this.computeConformanceButtonColor();
    if (!buttonColor) return 'white';
    return textColorForBackgroundColor(buttonColor);
  }

  get conformanceValue() {
    const tree = this.conformanceCheckingService.variantsTreeConformance.get(
      this.variant
    );

    if (!tree) return null;

    return this.conformanceCheckingService.isConformanceWeighted &&
      tree.conformance.weighted_by_counts != undefined
      ? tree.conformance.weighted_by_counts.value
      : tree.conformance.weighted_equally.value;
  }

  get isConformanceActive() {
    return this.conformanceCheckingService.isTreeConformanceActive(
      this.variant
    );
  }

  get isConformanceAvailable() {
    return this.conformanceCheckingService.isTreeConformanceAvailable(
      this.variant
    );
  }

  get isConformanceCalcInProgress() {
    if (this.variant === undefined) return false;
    return this.conformanceCheckingService.isTreeConformanceCalcInProgress(
      this.variant
    );
  }

  get deleteButtonTooltip() {
    return 'remove conformance values of this variant';
  }
}
