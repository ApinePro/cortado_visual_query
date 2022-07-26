import { VariantDrawerDirective } from 'src/app/directives/variant-drawer/variant-drawer.directive';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Variant } from 'src/app/objects/Variants/variant';

@Component({
  selector: 'app-infix-selection-controlls',
  templateUrl: './infix-selection-controlls.component.html',
  styleUrls: ['./infix-selection-controlls.component.css'],
})
export class InfixSelectionControllsComponent {
  constructor() {}

  @Input()
  variant: Variant;

  @Input()
  variantDrawer: VariantDrawerDirective;

  @Input()
  traceInfixSelectionMode: boolean = false;

  @Output()
  public selectTraceInfix = new EventEmitter<Variant>();


  addCurrentSelectedInfix() : void {
    this.selectTraceInfix.emit(this.variant)
  }

  resetSelectionStatus(): void {
    this.variant.variant.resetSelectionStatus();
    this.variantDrawer.redraw();
  }

  undoSelection(): void {
    this.variant.variant.undoSelection();
    this.variantDrawer.redraw();
  }

  redoSelection(): void {
    this.variant.variant.redoSelection();
    this.variantDrawer.redraw();
  }
}
