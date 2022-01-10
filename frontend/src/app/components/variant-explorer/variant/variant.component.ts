import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { Variant } from '../model';
import { VariantFragmentComponent } from '../variant-fragment/variant-fragment.component';

@Component({
  selector: '[app-variant]',
  templateUrl: './variant.component.html',
  styleUrls: ['./variant.component.scss']
})
export class VariantComponent implements AfterViewInit, OnDestroy {
  @Input()
  index: number;

  @Input()
  variant: Variant;

  @Input()
  colorMap: Map<string, string>;

  @Output()
  public selectionChanged = new EventEmitter<boolean>();

  @Output()
  public updateConformance = new EventEmitter<Variant>();

  @ViewChild('row')
  rowElement: ElementRef;

  @ViewChild('fragment')
  variantFragment: VariantFragmentComponent;

  isVisible: boolean = false;

  ngAfterViewInit(): void {
    const self = this;
    const observer = new IntersectionObserver(function (entries) {
      self.isVisible = entries[0]['isIntersecting'];
    }, { root: null, rootMargin: "200px 0px 200px 0px" });

    observer.observe(this.rowElement.nativeElement);

    if (this.index < 100) {
      this.isVisible = true;
    }
  }

  ngOnDestroy(): void {
    console.log("Destroyed");
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
