import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Variant } from '../model';

@Component({
  selector: 'app-variant-info',
  templateUrl: './variant-info.component.html',
  styleUrls: ['./variant-info.component.css']
})
export class VariantInfoComponent {
  @Input()
  outdatedConformanceStatistics: boolean;

  @Input()
  variant: Variant;

  @Output()
  public selectionChanged = new EventEmitter<boolean>();

  @Output()
  public updateConformance = new EventEmitter<Variant>();

  conformanceIconClicked(): void {
    if (this.isConformanceUpdatePossible()) {
      this.updateConformance.emit(this.variant);
    }
  }

  isConformanceUpdatePossible(): boolean {
    return !this.variant.calculationInProgress && (this.variant.isConformanceOutdated || this.variant.isTimeouted);
  }
}
