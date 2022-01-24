import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ElementRef,
} from '@angular/core';
import { Component, Input, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { Selection } from 'd3';
import { HumanizeDurationPipe } from 'src/app/pipes/humanize-duration.pipe';
import { PolygonGeneratorService } from 'src/app/services/polygon-generator.service';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import { VariantPerformanceService } from 'src/app/services/variant-performance.service';
import { textColorForBackgroundColor } from '../helper_functions';
import {
  Constants,
  InvisibleSequenceGroup,
  LeafNode,
  ParallelGroup,
  SequenceGroup,
  VariantElement,
  WaitingTimeNode,
} from '../model';
import { ActivateTooltipsService } from '../../../services/activateTooltipsService/activate-tooltips.service';
import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';

@Component({
  selector: 'app-variant-fragment',
  templateUrl: './variant-fragment.component.html',
  styleUrls: ['./variant-fragment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariantFragmentComponent implements AfterViewInit {
  constructor(
    private polygonService: PolygonGeneratorService,
    private variantPerformanceService: VariantPerformanceService,
    private sharedDataService: SharedDataService,
    private tooltipService: ActivateTooltipsService,
    private colorMapService: ColorMapService
  ) {
    this.variantPerformanceService.serviceTimeColorMap.subscribe((colorMap) => {
      if (colorMap !== undefined) {
        this.performanceColorMap = colorMap;
        if (this.inspectionMode) {
          this.redraw();
        }
      }
    });
    this.variantPerformanceService.waitingTimeColorMap.subscribe((colorMap) => {
      if (colorMap !== undefined) {
        this.waitingColorMap = colorMap;
        if (this.inspectionMode) {
          this.redraw();
        }
      }
    });
  }

  @ViewChild('svg')
  svgHtmlElement: ElementRef;

  @Input()
  variant: VariantElement;

  colorMap: Map<string, string>;

  svgSelection!: Selection<any, any, any, any>;

  public inspectionMode: boolean;

  private performanceColorMap;
  private waitingColorMap;

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

    this.colorMapService.colorMap$.subscribe((colorMap) => {
      this.colorMap = colorMap;
      this.redraw();
    });

    this.redraw();

    this.variantPerformanceService.variantPerformanceMode.subscribe(
      (perfMode) => {
        if (perfMode !== undefined && perfMode !== this.inspectionMode) {
          if (perfMode) {
            this.variant.setExpanded(true);
          }
          this.setInspectVariant(perfMode);
        }
      }
    );
  }

  redraw(): void {
    const height = this.variant.recalculateHeight(this.inspectionMode);
    const width = this.variant.recalculateWidth(this.inspectionMode);
    this.variant.updateWidth(this.inspectionMode);

    d3.select(this.svgHtmlElement.nativeElement)
      .attr('width', width)
      .attr('height', height);

    this.svgSelection.selectAll('*').remove();

    const svg = this.svgSelection.attr('width', width).attr('height', height);

    this.draw(this.variant, svg, true);

    if (this.variant instanceof SequenceGroup && !this.inspectionMode) {
      this.svgSelection.select('polygon').style('fill', 'transparent');
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

    this.tooltipService.initializeChildren(this.svgHtmlElement);
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

    if (element instanceof InvisibleSequenceGroup) {
      polygon.style('fill', 'transparent');
    } else {
      parent.on('click', (e: PointerEvent) => {
        if (this.inspectionMode) {
          this.changeSelected(element);
          this.variantPerformanceService.setSelectedVariantElement(element);
          e.stopPropagation();
        }
      });
    }

    let x =
      outerElement && !this.inspectionMode
        ? 0
        : element.getHeadLength() +
          element.getMarginX() -
          element.elements[0].getHeadLength();

    for (const child of element.elements) {
      if (child instanceof WaitingTimeNode && !this.inspectionMode) {
        continue;
      }
      const width = child.getWidth(this.inspectionMode);
      const childHeight = child.getHeight();
      const y = height / 2 - childHeight / 2;
      const g = parent.append('g').attr('transform', `translate(${x}, ${y})`);

      this.draw(child, g);
      x += width;
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
    parent
      .append('polygon')
      .attr('points', polygonPoints)
      .style('fill', color)
      .classed('variant-group-element', true)
      .classed('variant-parallel-group', true)
      .classed('variant-polygon', true);

    parent.on('click', (e: PointerEvent) => {
      if (this.inspectionMode) {
        this.changeSelected(element);
        this.variantPerformanceService.setSelectedVariantElement(element);
        e.stopPropagation();
      }
    });

    let y = Constants.MARGIN_Y;
    for (const child of element.elements) {
      if (child instanceof WaitingTimeNode && !this.inspectionMode) {
        continue;
      }
      const height = child.getHeight();
      const x = element.getHeadLength() + 0.5 * Constants.MARGIN_X;
      const g = parent.append('g').attr('transform', `translate(${x}, ${y})`);
      this.draw(child, g);
      y += height + Constants.MARGIN_Y;
    }
  }

  public drawLeafNode(
    element: LeafNode,
    parent: Selection<any, any, any, any>
  ): void {
    const width = element.getWidth();
    const height = element.getHeight();

    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    let color = this.colorMap.get(element.activity[0]);

    if (element.activity.length > 1) {
      color = '#d3d3d3'; // lightgrey
    }

    if (element.serviceTime?.mean !== undefined && this.inspectionMode) {
      let stat = this.variantPerformanceService.serviceTimeStatistic;
      color = this.performanceColorMap(element.serviceTime[stat]);
      if (color == undefined) {
        color = '#d3d3d3'; // lightgrey
      }
    } else if (this.variant.serviceTime && this.inspectionMode) {
      color = '#d3d3d3';
    }

    parent
      .append('polygon')
      .attr('points', polygonPoints)
      .style('fill', color)
      .classed('variant-polygon', true);

    parent.on('click', (e: PointerEvent) => {
      if (this.inspectionMode) {
        this.changeSelected(element);
        this.variantPerformanceService.setSelectedVariantElement(element);
        e.stopPropagation();
      }
    });

    const activityText = parent
      .append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', Constants.FONT_SIZE)
      .attr('fill', textColorForBackgroundColor(color))
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
  }

  private drawWaitingNode(
    element: LeafNode,
    parent: Selection<any, any, any, any>
  ) {
    const width = element.getWidth();
    const height = element.getHeight();

    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    let color = 'lightgrey';
    if (element.waitingTime?.mean !== undefined && this.inspectionMode) {
      let stat = this.variantPerformanceService.waitingTimeStatistic;
      color = this.waitingColorMap(element.waitingTime[stat]);
    }
    if (color == undefined) {
      color = 'lightgrey';
    }

    parent
      .append('polygon')
      .attr('points', polygonPoints)
      .style('fill', color)
      .classed('variant-polygon', true);

    parent.on('click', (e: PointerEvent) => {
      if (this.inspectionMode) {
        this.changeSelected(element);
        this.variantPerformanceService.setSelectedVariantElement(element);
        e.stopPropagation();
      }
    });
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

  setExpanded(expanded: boolean): void {
    expanded = this.inspectionMode || expanded;
    let redraw = expanded != this.variant.expanded;
    this.variant.setExpanded(expanded);
    if (redraw) {
      this.redraw();
    }
  }

  isExpanded(): boolean {
    return this.variant.expanded;
  }

  setSelected(selected: boolean): void {
    this.variant.setExpanded(selected);
    this.redraw();

    // make sure clear disables inspectionMode
    this.setInspectVariant(this.inspectionMode && selected);
  }

  setInspectVariant(inspectionMode: boolean) {
    this.inspectionMode = inspectionMode;
    this.redraw();

    d3.select('.selected-polygon').classed('selected-polygon', false);
    d3.selectAll('.variant-polygon').classed(
      'cursor-pointer',
      this.inspectionMode
    );
    d3.selectAll('.activity-text').classed(
      'cursor-pointer',
      this.inspectionMode
    );
  }

  toggleInspectVariant() {
    this.setInspectVariant(!this.inspectionMode);
  }

  changeSelected(group: VariantElement) {
    d3.selectAll('.variant-element-group').classed(
      'selected-polygon',
      (d) => group === d
    );
  }

  getSVGGraphicElement(): SVGGraphicsElement {
    return this.svgHtmlElement.nativeElement;
  }
}
