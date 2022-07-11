import { VARIANT_Constants } from './../../../constants/variant_element_drawer_constants';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import * as d3 from 'd3';
import { Selection } from 'd3';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import { ActivateTooltipsService } from '../../../services/activateTooltipsService/activate-tooltips.service';
import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';

@Component({
  selector: 'app-sub-variant',
  templateUrl: './sub-variant.component.html',
  styleUrls: ['./sub-variant.component.scss'],
})
export class SubVariantComponent implements AfterViewInit {
  @ViewChild('svg')
  svgElement: ElementRef;

  @Input()
  set variant(value: [string, string][][]) {
    this._variant = value;
    if (this.isLoaded) {
      this.draw();
    }
  }

  private _variant: [string, string][][];

  @Input()
  private expanded = false;

  private isLoaded = false;

  svg: Selection<any, any, any, any>;
  public colorMap: Map<string, string>;

  constructor(
    private sharedDataService: SharedDataService,
    private colorMapService: ColorMapService,
    private tooltipService: ActivateTooltipsService
  ) {}

  ngAfterViewInit(): void {
    this.svg = d3.select(this.svgElement.nativeElement);
    this.isLoaded = true;

    this.colorMapService.colorMap$.subscribe((cMap) => {
      this.colorMap = cMap;
      this.draw();
    });
  }

  draw(textColor: string = 'whitesmoke'): void {
    const intervalWidth = !this.expanded
      ? VARIANT_Constants.INTERVAL_LENGTH
      : VARIANT_Constants.INTERVAL_LENGTH * 1.5;
    this.svg.selectAll('g').remove();
    const [data, yLength] = this.buildData();
    const xScale = (x) => VARIANT_Constants.POINT_RADIUS + x * intervalWidth;
    const yScale = (y) =>
      4 * VARIANT_Constants.POINT_RADIUS + y * VARIANT_Constants.LEAF_HEIGHT * 1.5;

    const groupedData = d3.group(data, (d) => d[4]);
    const g = this.svg.selectAll().data(groupedData).join('g');

    g.append('line')
      .filter(([_, d]) => d.length === 2)
      .style('stroke', ([_, d]) => this.colorMap.get(d[0][2]))
      .attr('x1', ([_, d]) => xScale(d[0][0]))
      .attr('x2', ([_, d]) => xScale(d[1][0]))
      .attr('y1', ([_, d]) => yScale(d[0][1]))
      .attr('y2', ([_, d]) => yScale(d[1][1]))
      .attr('stroke-width', ([_, d]) => 2 * VARIANT_Constants.POINT_RADIUS);

    const circles = g
      .selectAll('circle')
      .data(([_, d]) => d)
      .join('circle')
      .attr('cx', (d) => xScale(d[0]))
      .attr('cy', (d) => yScale(d[1]))
      .attr('fill', (d) => this.colorMap.get(d[2]))
      .attr('r', VARIANT_Constants.POINT_RADIUS);

    circles
      .filter((d) => d[3] === 'atomic')
      .attr('data-bs-toggle', 'tooltip')
      .attr('title', (d) => d[2]);

    const texts = g
      .filter(([_, d]) => d.length === 2)
      .append('text')
      .attr('x', ([_, d]) => xScale(d[0][0] + (d[1][0] - d[0][0]) / 2))
      .attr('y', ([_, d]) => yScale(d[0][1]) - VARIANT_Constants.POINT_RADIUS - 5)
      .style('text-anchor', 'middle')
      .style('fill', textColor)
      .text(([_, d]) => d[0][2]);

    texts.each((a, b, c) => {
      const sel = d3.select(c[b]);
      const xStart = xScale(a[1][0][0]);
      const xEnd = xScale(a[1][1][0]);
      this.wrapInnerLabelText(
        sel,
        sel.text(),
        xEnd - xStart - 2 * VARIANT_Constants.POINT_RADIUS
      );
    });

    this.svg.attr(
      'height',
      yLength * VARIANT_Constants.LEAF_HEIGHT + 6 * VARIANT_Constants.POINT_RADIUS
    );
    this.svg.attr(
      'width',
      this._variant.length * intervalWidth + 2 * VARIANT_Constants.POINT_RADIUS
    );
    this.svg.attr('overflow', 'visible');

    this.tooltipService.initializeChildren(this.svgElement);
  }

  private wrapInnerLabelText(
    textSelection: Selection<any, any, any, any>,
    text: string,
    maxWidth: number
  ): boolean {
    const originalText = text;
    let textLength = this.getComputedTextLength(textSelection);
    let truncated = false;
    while (textLength > maxWidth && text.length > 1) {
      text = text.slice(0, -1);
      textSelection.text(text + '..');
      textLength = this.getComputedTextLength(textSelection);
      truncated = true;
    }

    textSelection.attr('data-bs-toggle', 'tooltip').attr('title', originalText);
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

  private buildData(): [any[], number] {
    const intervalWidth = VARIANT_Constants.INTERVAL_LENGTH;
    const gapLength = (20 + VARIANT_Constants.POINT_RADIUS) / intervalWidth;

    const yIndices: boolean[] = [];
    const starts = new Map<string, [number, number][]>();
    const data = [];
    let xIndex = 0;
    this._variant.forEach((group, _i) => {
      group.sort();
      let starting = group
        .filter(([_a, l]) => l.toLowerCase() === 'start')
        .map(([a, _l]) => a);
      let completing = group
        .filter(([_a, l]) => l.toLowerCase() === 'complete')
        .map(([a, _l]) => a);
      const atomic = completing.filter((a) => starting.includes(a));
      starting = starting.filter((a) => !atomic.includes(a));
      completing = completing.filter((a) => !atomic.includes(a));

      starting.forEach((a) => {
        let yIndex = 0;
        while (yIndices[yIndex]) {
          yIndex++;
        }
        yIndices[yIndex] = true;
        const aStarts = starts.get(a) || [];
        aStarts.push([xIndex, yIndex]);
        starts.set(a, aStarts);

        const id = [xIndex, yIndex, a].join(';');
        data.push([xIndex, yIndex, a, 'start', id]);
      });

      const atomicYIndices = [];
      atomic.forEach((a) => {
        let yIndex = 0;
        while (yIndices[yIndex]) {
          yIndex++;
        }
        yIndices[yIndex] = true;
        atomicYIndices.push(yIndex);

        const id = [xIndex, yIndex, a].join(';');
        data.push([xIndex, yIndex, a, 'atomic', id]);
      });

      completing.forEach((a) => {
        const [xStartIndex, yIndex] = starts.get(a).shift();
        yIndices[yIndex] = false;
        const id = [xStartIndex, yIndex, a].join(';');
        data.push([xIndex, yIndex, a, 'complete', id]);
      });

      atomicYIndices.forEach((yIndex) => {
        yIndices[yIndex] = false;
      });

      const nRunning = Array.from(starts.values())
        .map((s) => s.length)
        .reduce((a, b) => a + b, 0);
      if (nRunning <= 0) {
        xIndex += gapLength;
      } else {
        xIndex += 1;
      }
    });

    return [data, yIndices.length];
  }

  public setExpanded(expanded: boolean): void {
    this.expanded = expanded;
    this.draw();
  }

  public toggleExpanded() {
    this.expanded = !this.expanded;
    this.draw();
  }
}
