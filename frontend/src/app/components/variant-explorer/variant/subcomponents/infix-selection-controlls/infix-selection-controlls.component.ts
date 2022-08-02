import { VariantDrawerDirective } from 'src/app/directives/variant-drawer/variant-drawer.directive';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Variant } from 'src/app/objects/Variants/variant';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-infix-selection-controlls]',
  templateUrl: './infix-selection-controlls.component.html',
  styleUrls: ['./infix-selection-controlls.component.css'],
})
export class InfixSelectionControllsComponent {
  constructor() {}

  isAnyInfixSelected = true;

  @Input()
  variant: Variant;

  @Input()
  variantDrawer: VariantDrawerDirective;

  @Output()
  public selectTraceInfix = new EventEmitter<Variant>();

  addCurrentSelectedInfix(): void {
    this.selectTraceInfix.emit(this.variant);
  }

  resetSelectionStatus(): void {
    this.variant.variant.resetSelectionStatus();
    this.variantDrawer.redraw();
  }
}
