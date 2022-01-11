import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { LazyLoadingServiceService } from 'src/app/services/lazyLoadingService/lazy-loading.service';
import { Variant } from '../model';
import { VariantFragmentComponent } from '../variant-fragment/variant-fragment.component';

/* tslint:disable:component-selector */
@Component({
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
  colorMap: Map<string, string>;

  @Input()
  rootElement: ElementRef;

  @Output()
  public selectionChanged = new EventEmitter<boolean>();

  @Output()
  public updateConformance = new EventEmitter<Variant>();

  @ViewChild('row')
  rowElement: ElementRef;

  @ViewChild('fragment')
  variantFragment: VariantFragmentComponent;

  isVisible: boolean = false;

  constructor(private lazyLoadingService: LazyLoadingServiceService) {}

  ngAfterViewInit(): void {
    const self = this;
    this.lazyLoadingService.addVariant(
      this.rowElement,
      this.rootElement,
      (isIntersecting) => (self.isVisible = isIntersecting)
    );
  }

  isExpanded(): boolean {
    return this.variant.variant.expanded;
  }

  setExpanded(expanded: boolean): void {
    this.variant.variant.setExpanded(expanded);
    if (this.variantFragment !== undefined && this.variantFragment !== null) {
      this.variantFragment.redraw();
    }
  }

  getSVGGraphicElement(): SVGGraphicsElement {
    return this.variantFragment.getSVGGraphicElement();
  }
}
