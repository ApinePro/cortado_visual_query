import {
  Directive,
  EventEmitter,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { AfterViewInit, ElementRef } from '@angular/core';
import { Input } from '@angular/core';
import * as d3 from 'd3';
import { Selection, svg } from 'd3';
import { PolygonGeneratorService } from 'src/app/services/polygon-generator.service';
import { textColorForBackgroundColor } from '../components/variant-explorer/helper_functions';
import {
  Constants,
  InvisibleSequenceGroup,
  LeafNode,
  ParallelGroup,
  SequenceGroup,
  VariantElement,
  WaitingTimeNode,
} from '../components/variant-explorer/model';
import { ActivateTooltipsService } from '../services/activateTooltipsService/activate-tooltips.service';
import { SharedDataService } from '../services/sharedDataService/shared-data.service';

@Directive({
  selector: '[appVariantDrawer]',
})
export class VariantDrawerDirective implements AfterViewInit, OnChanges {
  setExpanded(expanded: boolean) {
    this.variant.setExpanded(expanded);
    this.redraw();
  }

  constructor(
    elRef: ElementRef,
    private polygonService: PolygonGeneratorService,
    private sharedDataService: SharedDataService,
    private tooltipService: ActivateTooltipsService
  ) {
    this.svgHtmlElement = elRef;
  }

  svgHtmlElement: ElementRef;

  @Input()
  variant: VariantElement;

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
    element: VariantElement,
    variant: VariantElement
  ) => void;

  @Input()
  onMouseOverCbFc: (
    drawerDirective: VariantDrawerDirective,
    element: VariantElement,
    variant: VariantElement,
    selection
  ) => void;

  @Output()
  selection = new EventEmitter<Selection<any, any, any, any>>();

  svgSelection!: Selection<any, any, any, any>;

  deserialize(obj: any): VariantElement {
    if ('follows' in obj) {
      return new SequenceGroup(
        obj.follows.map((e: any) => this.deserialize(e))
      );
    } else if ('parallel' in obj) {
      return new ParallelGroup(
        obj.parallel.map((e: any) => this.deserialize(e))
      );
    } else {
      return new LeafNode(obj.leaf);
    }
  }

  ngAfterViewInit(): void {
    this.svgSelection = d3
      .select(this.svgHtmlElement.nativeElement)
      .append('g');

    this.redraw();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.variant &&
      !changes.variant.firstChange &&
      changes.variant.currentValue
    ) {
      this.redraw();
    } else if (
      changes.performanceMode &&
      !changes.performanceMode.firstChange
    ) {
      if (changes.performanceMode.currentValue) {
        this.variant.setExpanded(true);
      }

      this.redraw();
      this.setInspectVariant();
    } else if (
      changes.traceInfixSelectionMode &&
      (!changes.variant || !changes.variant.firstChange)
    ) {
      this.redraw();
    }
  }

  redraw(): void {
    this.svgSelection.selectAll('*').remove();

    if (this.variant) {
      const height = this.variant.recalculateHeight(this.performanceMode);
      const width = this.variant.recalculateWidth(this.performanceMode);

      this.variant.updateWidth(this.performanceMode);

      d3.select(this.svgHtmlElement.nativeElement)
        .attr('width', width)
        .attr('height', height);

      const svg = this.svgSelection.attr('width', width).attr('height', height);

      this.draw(this.variant, svg, true);
      this.tooltipService.initializeChildren(this.svgHtmlElement);

      if (this.variant instanceof SequenceGroup && !this.performanceMode) {
        this.svgSelection.select('polygon').style('fill', 'transparent');
      }

      this.selection.emit(this.svgSelection);
    }
  }

  draw(
    element: VariantElement,
    svgElement: Selection<any, any, any, any>,
    outerElement: boolean = false
  ): void {
    svgElement.datum(element).classed('variant-element-group', true);

    if (element instanceof ParallelGroup) {
      this.drawParallelGroup(element.asParallelGroup(), svgElement);
    } else if (element instanceof SequenceGroup) {
      this.drawSequenceGroup(
        element.asSequenceGroup(),
        svgElement,
        outerElement
      );
    } else if (element instanceof LeafNode) {
      this.drawLeafNode(element.asLeafNode(), svgElement);
    } else if (element instanceof WaitingTimeNode) {
      this.drawWaitingNode(element.asLeafNode(), svgElement);
    }
  }

  drawSequenceGroup(
    element: SequenceGroup,
    parent: Selection<any, any, any, any>,
    outerElement
  ): void {
    const width = element.getWidth();
    const height = element.getHeight();
    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    const color = 'lightgrey';

    let polygon = parent
      .append('polygon')
      .attr('points', polygonPoints)
      .style('fill', color)
      .classed('variant-group-element', true)
      .classed('variant-sequence-group', true)
      .classed('variant-polygon', true);

    if (
      this.traceInfixSelectionMode &&
      element.parent &&
      !(element instanceof InvisibleSequenceGroup)
    ) {
      this.addInfixSelectionAttributes(element, polygon, parent, false);
    }

    if (element instanceof InvisibleSequenceGroup) {
      polygon.style('fill', 'transparent');
    } else {
      if (this.onClickCbFc) {
        parent.on('click', (e: PointerEvent) => {
          this.onClickCbFc(this, element, this.variant);
          e.stopPropagation();
        });
      }
    }

    let x =
      outerElement && !this.performanceMode
        ? 0
        : element.getHeadLength() +
          element.getMarginX() -
          element.elements[0].getHeadLength();

    for (const child of element.elements) {
      if (child instanceof WaitingTimeNode && !this.performanceMode) {
        continue;
      }

      const width = child.getWidth(this.performanceMode);
      const childHeight = child.getHeight();
      const y = height / 2 - childHeight / 2;
      const g = parent.append('g').attr('transform', `translate(${x}, ${y})`);

      this.draw(child, g, false);
      x += width;
    }

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, this.variant, parent);
    }
  }

  drawParallelGroup(
    element: ParallelGroup,
    parent: Selection<any, any, any, any>
  ): void {
    const width = element.getWidth();
    const height = element.getHeight();

    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    const color = 'lightgrey';
    let polygon = parent
      .append('polygon')
      .attr('points', polygonPoints)
      .style('fill', color)
      .classed('variant-group-element', true)
      .classed('variant-parallel-group', true)
      .classed('variant-polygon', true);

    if (
      this.traceInfixSelectionMode &&
      !(element instanceof InvisibleSequenceGroup)
    ) {
      this.addInfixSelectionAttributes(element, polygon, parent, false);
    }

    if (this.onClickCbFc) {
      parent.on('click', (e: PointerEvent) => {
        this.onClickCbFc(this, element, this.variant);
        e.stopPropagation();
      });
    }

    let y = Constants.MARGIN_Y;

    for (const child of element.elements) {
      if (child instanceof WaitingTimeNode && !this.performanceMode) {
        continue;
      }

      const height = child.getHeight();
      const x = element.getHeadLength() + 0.5 * Constants.MARGIN_X;
      const g = parent.append('g').attr('transform', `translate(${x}, ${y})`);
      this.draw(child, g, false);
      y += height + Constants.MARGIN_Y;
    }

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, this.variant, parent);
    }
  }

  public drawLeafNode(
    element: LeafNode,
    parent: Selection<any, any, any, any>
  ): void {
    const width = element.getWidth();
    const height = element.getHeight();

    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    const color = this.computeActivityColor(this, element, this.variant);

    const rgb_code = [
      color.substring(1, 3),
      color.substring(3, 5),
      color.substring(5, 7),
    ];
    const inversed = rgb_code.map((d) => 255 - parseInt(d, 16));

    let polygon = parent
      .append('polygon')
      .attr('points', polygonPoints)
      .style('fill', color)
      .classed('variant-polygon', true);

    if (this.traceInfixSelectionMode) {
      this.addInfixSelectionAttributes(element, polygon, parent, true);
    }

    if (this.onClickCbFc) {
      parent.on('click', (e: PointerEvent) => {
        this.onClickCbFc(this, element, this.variant);
        e.stopPropagation();
      });
    }

    const textcolor = textColorForBackgroundColor(
      color,
      this.traceInfixSelectionMode && !element.selected
    );

    const activityText = parent
      .append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .classed('user-select-none', true)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', Constants.FONT_SIZE)
      .attr('fill', textcolor)
      .classed('activity-text', true);

    let y = height / 2;
    if (element.activity.length > 1) {
      y =
        height / 2 -
        ((element.activity.length - 1) / 2) *
          (Constants.FONT_SIZE + Constants.MARGIN_Y);
    }

    let truncated = false;
    let dy = 0;
    element.activity.forEach((a, _i) => {
      const tspan = activityText
        .append('tspan')
        .attr('x', width / 2)
        .attr('y', y + dy)
        .classed('cursor-pointer', true)
        .text(a);

      dy += Constants.FONT_SIZE + Constants.MARGIN_Y;
      tspan.attr('height', Constants.FONT_SIZE + Constants.MARGIN_Y);

      const maxWidth =
        element.getWidth() - element.getHeadLength() * 2 - Constants.MARGIN_X;
      const tr = this.wrapInnerLabelText(tspan, a, maxWidth);
      truncated ||= tr;
    });

    if (truncated) {
      activityText
        .attr('title', element.activity.join(';'))
        .attr('data-bs-toggle', 'tooltip');
    }

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, this.variant, parent);
    }
  }

  private addInfixSelectionAttributes(
    element: VariantElement,
    polygon: any,
    parent: any,
    isLeafNode: boolean
  ) {
    if (element.selected) {
      polygon
        .attr('stroke', '#ff0000')
        .attr('stroke-width', '4px')
        .attr('stroke-opacity', '0.5');
      return;
    }

    if (!element.selectable) {
      polygon.style('fill-opacity', '0.1');
      return;
    }

    // element is selectable
    polygon
      .attr('stroke', '#ff0000')
      .attr('stroke-width', '1px')
      .attr('stroke-dasharray', 4)
      .classed('selectable-trace-infix', true);

    if (isLeafNode) {
      polygon.style('fill-opacity', '0.2');
    } else {
      polygon.style('fill', '#999999');
    }

    parent
      .append('path')
      .attr(
        'd',
        'M2.5 0c-.166 0-.33.016-.487.048l.194.98A1.51 1.51 0 0 1 2.5 1h.458V0H2.5zm2.292 0h-.917v1h.917V0zm1.833 0h-.917v1h.917V0zm1.833 0h-.916v1h.916V0zm1.834 0h-.917v1h.917V0zm1.833 0h-.917v1h.917V0zM13.5 0h-.458v1h.458c.1 0 .199.01.293.029l.194-.981A2.51 2.51 0 0 0 13.5 0zm2.079 1.11a2.511 2.511 0 0 0-.69-.689l-.556.831c.164.11.305.251.415.415l.83-.556zM1.11.421a2.511 2.511 0 0 0-.689.69l.831.556c.11-.164.251-.305.415-.415L1.11.422zM16 2.5c0-.166-.016-.33-.048-.487l-.98.194c.018.094.028.192.028.293v.458h1V2.5zM.048 2.013A2.51 2.51 0 0 0 0 2.5v.458h1V2.5c0-.1.01-.199.029-.293l-.981-.194zM0 3.875v.917h1v-.917H0zm16 .917v-.917h-1v.917h1zM0 5.708v.917h1v-.917H0zm16 .917v-.917h-1v.917h1zM0 7.542v.916h1v-.916H0zm15 .916h1v-.916h-1v.916zM0 9.375v.917h1v-.917H0zm16 .917v-.917h-1v.917h1zm-16 .916v.917h1v-.917H0zm16 .917v-.917h-1v.917h1zm-16 .917v.458c0 .166.016.33.048.487l.98-.194A1.51 1.51 0 0 1 1 13.5v-.458H0zm16 .458v-.458h-1v.458c0 .1-.01.199-.029.293l.981.194c.032-.158.048-.32.048-.487zM.421 14.89c.183.272.417.506.69.689l.556-.831a1.51 1.51 0 0 1-.415-.415l-.83.556zm14.469.689c.272-.183.506-.417.689-.69l-.831-.556c-.11.164-.251.305-.415.415l.556.83zm-12.877.373c.158.032.32.048.487.048h.458v-1H2.5c-.1 0-.199-.01-.293-.029l-.194.981zM13.5 16c.166 0 .33-.016.487-.048l-.194-.98A1.51 1.51 0 0 1 13.5 15h-.458v1h.458zm-9.625 0h.917v-1h-.917v1zm1.833 0h.917v-1h-.917v1zm1.834-1v1h.916v-1h-.916zm1.833 1h.917v-1h-.917v1zm1.833 0h.917v-1h-.917v1zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z'
      )
      .classed('show-only-on-hover', true);
  }

  private drawWaitingNode(
    element: LeafNode,
    parent: Selection<any, any, any, any>
  ) {
    const width = element.getWidth();
    const height = element.getHeight();

    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    const color = this.computeActivityColor(this, element, this.variant);

    parent
      .append('polygon')
      .attr('points', polygonPoints)
      .style('fill', color)
      .classed('variant-polygon', true);

    if (this.onClickCbFc) {
      parent.on('click', (e: PointerEvent) => {
        this.onClickCbFc(this, element, this.variant);
        e.stopPropagation();
      });
    }

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, this.variant, parent);
    }
  }

  private wrapInnerLabelText(
    textSelection: Selection<any, any, any, any>,
    text: string,
    maxWidth: number
  ): boolean {
    let textLength = this.getComputedTextLength(textSelection);
    let truncated = false;
    while (textLength > maxWidth && text.length > 1) {
      text = text.slice(0, -1);
      textSelection.text(text + '..');
      textLength = this.getComputedTextLength(textSelection);
      truncated = true;
    }
    return truncated;
  }

  private getComputedTextLength(
    textSelection: Selection<any, any, any, any>
  ): number {
    let textLength;
    if (
      this.sharedDataService.computedTextLengthCache.has(textSelection.text())
    ) {
      textLength = this.sharedDataService.computedTextLengthCache.get(
        textSelection.text()
      );
    } else {
      textLength = textSelection.node().getComputedTextLength();
    }
    this.sharedDataService.computedTextLengthCache.set(
      textSelection.text(),
      textLength
    );
    return textLength;
  }

  getSVGGraphicElement(): SVGGraphicsElement {
    return this.svgHtmlElement.nativeElement;
  }

  isExpanded(): boolean {
    return this.variant.expanded;
  }

  setInspectVariant() {
    d3.select('.selected-polygon').classed('selected-polygon', false);
    d3.selectAll('.variant-polygon').classed(
      'cursor-pointer',
      this.performanceMode
    );
    d3.selectAll('.activity-text').classed(
      'cursor-pointer',
      this.performanceMode
    );
  }

  changeSelected(group: VariantElement) {
    d3.selectAll('.variant-element-group')
      .selectAll('polygon')
      .classed('selected-polygon', (d) => group === d);
  }
}
