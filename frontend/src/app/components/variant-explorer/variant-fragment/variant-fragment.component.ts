import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ElementRef,
} from '@angular/core';
import { Component, Input, ViewChild } from '@angular/core';
import { Selection } from 'd3';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer.directive';
import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';
import { VariantElement } from '../model';

//@REFRACTOR THIS COMPONENT IS GOING TO BE DELETED SOON, CHECK OUT THE VARIANT DRAWER DIRECTIVE AND VARIANT COMPONENT
@Component({
  selector: 'app-variant-fragment',
  templateUrl: './variant-fragment.component.html',
  styleUrls: ['./variant-fragment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariantFragmentComponent {
  constructor() {}

  @ViewChild('svg')
  svgHtmlElement: ElementRef;

  @ViewChild(VariantDrawerDirective)
  variantDrawer: VariantDrawerDirective;

  @Input()
  variant: VariantElement;

  @Input()
  disablePerformanceMode: boolean = false;

  colorMap: Map<string, string>;

  svgSelection!: Selection<any, any, any, any>;

  public inspectionMode: boolean;

  setExpanded(expanded: boolean): void {
    expanded = this.inspectionMode || expanded;
    let redraw = expanded != this.variant.expanded;
    this.variant.setExpanded(expanded);

    if (redraw) {
      this.variantDrawer.redraw();
    }
  }

  getSVGGraphicElement(): SVGGraphicsElement {
    return this.variantDrawer.getSVGGraphicElement();
  }
}
