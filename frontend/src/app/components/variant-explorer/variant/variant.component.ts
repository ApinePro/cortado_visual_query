import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { isDevMode } from '@angular/core';
import { LazyLoadingServiceService } from 'src/app/services/lazyLoadingService/lazy-loading.service';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer/variant-drawer.directive';
import {
  InfixType,
} from 'src/app/objects/Variants/infix_selection';
import { Variant } from 'src/app/objects/Variants/variant';
import {
  VariantElement,
} from 'src/app/objects/Variants/variant_element';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-variant]',
  templateUrl: './variant.component.html',
  styleUrls: ['./variant.component.scss'],
})
export class VariantComponent implements AfterViewInit {
  @Input()
  index: number;

  @Input()
  variant: Variant;

  @Input()
  rootElement: ElementRef;

  @Input()
  performanceMode: boolean = false;

  @Input()
  traceInfixSelectionMode: boolean = false;

  @Input()
  computeActivityColor: (
    drawerDirective: VariantDrawerDirective,
    element: VariantElement,
    variant: VariantElement
  ) => string;

  @Input()
  onClickCbFc: (
    drawerDirective: VariantDrawerDirective,
    element: VariantElement
  ) => void;

  @Input()
  onRightMouseClickCbFc: (
    drawerDirective: VariantDrawerDirective,
    element: VariantElement,
    variant: VariantElement,
    event: Event
  ) => void;

  @Input()
  onMouseOverCbFc: (
    drawerDirective: VariantDrawerDirective,
    element: VariantElement
  ) => void;

  @Input()
  processTreeAvailable: boolean = false;

  @Output()
  public selectionChanged = new EventEmitter<boolean>();

  @Output()
  public updateConformance = new EventEmitter<Variant>();

  @Output()
  public openSubvariantWindow = new EventEmitter<number>();

  @Output()
  public selectTraceInfix = new EventEmitter<Variant>(); 

  @ViewChild('row')
  rowElement: ElementRef;

  @ViewChild(VariantDrawerDirective)
  variantDrawer: VariantDrawerDirective;

  @ViewChild('fragment')
  fragment: ElementRef;

  isVisible: boolean = false;
  // necessary because one cannot use it directly in the template file
  infixType = InfixType;

  // TODO: this is needed because we want to disable the selection of trace infixes for the 1.6.0 release.
  // Remove afterwards and re-enable selection.
  isDevMode = isDevMode();

  constructor(
    private lazyLoadingService: LazyLoadingServiceService,  ) {}

  ngAfterViewInit(): void {
    const self = this;

    this.lazyLoadingService.addVariant(
      this.rowElement.nativeElement.parentNode,
      this.rootElement,
      (isIntersecting) => (self.isVisible = isIntersecting)
    );
  }

  isExpanded(): boolean {
    return this.variant.variant.expanded;
  }

  openNewSubvariantWindow(index: number) {
    this.openSubvariantWindow.emit(index);
  }

  addCurrentSelectedInfix() {
    this.selectTraceInfix.emit(this.variant)
  }

  setExpanded(expanded: boolean): void {
    if (!this.performanceMode && expanded != this.variant.variant.expanded) {
      this.variant.variant.setExpanded(expanded);

      if (this.variantDrawer) {
        this.variantDrawer.redraw();
      }
    }
  }

  redraw() {
    if (this.variantDrawer) {
      this.variantDrawer.redraw();
    }
  }

  getSVGGraphicElement(): SVGGraphicsElement {
    return this.fragment.nativeElement;
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
