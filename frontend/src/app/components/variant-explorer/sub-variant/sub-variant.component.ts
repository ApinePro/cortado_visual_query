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
import { Constants } from '../model';
import { ActivateTooltipsService } from '../../../services/activateTooltipsService/activate-tooltips.service';
import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';
import { SubvariantVisualization } from './model';
import { ModelPerformanceColorScaleService } from 'src/app/services/performance-color-scale.service';

@Component({
  selector: 'app-sub-variant',
  templateUrl: './sub-variant.component.html',
  styleUrls: ['./sub-variant.component.scss'],
})
export class SubVariantComponent implements AfterViewInit {
  @ViewChild('svg')
  svgElement: ElementRef;

  @Input()
  set variant(value) {
    this._variant = value;
    if (this.isLoaded) {
      this.draw();
    }
  }

  private _variant;
  isPerformanceMode: boolean;

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
    console.log(this._variant);

    this.colorMapService.colorMap$.subscribe((cMap) => {
      this.colorMap = cMap;
      if (this._variant) {
        this.draw();
      }
    });
  }

  draw(textColor: string = 'whitesmoke'): void {
    const intervalWidth = !this.expanded
      ? Constants.INTERVAL_LENGTH
      : Constants.INTERVAL_LENGTH * 1.5;
    this.svg.selectAll('g').remove();
    const data = this.buildData();
    const dataArray = Array.from(data.values());
    const xScale = (x) => Constants.POINT_RADIUS + x * intervalWidth;
    const yScale = (y) =>
      4 * Constants.POINT_RADIUS + y * Constants.LEAF_HEIGHT * 1.5;

    const g = this.svg.selectAll().data(dataArray).join('g');

    g.append('line')
      .style('stroke', (d) => this.colorMap.get(d.activity))
      .attr('x1', (d) => xScale(d.xStart))
      .attr('x2', (d) => xScale(d.xEnd))
      .attr('y1', (d) => yScale(d.yIndex))
      .attr('y2', (d) => yScale(d.yIndex))
      .attr('stroke-width', (_) => 2 * Constants.POINT_RADIUS)
      .on('click', (_, d) => console.log(d.performanceStats));

    const circles = g
      .selectAll('circle')
      .data((d) => {
        if (d.xStart == d.xEnd) {
          return [[d.activity, d.xStart, d.yIndex, true]];
        }
        return [
          [d.activity, d.xStart, d.yIndex, false],
          [d.activity, d.xEnd, d.yIndex, false],
        ];
      })
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d[1]))
      .attr('cy', (d) => yScale(d[2]))
      .attr('fill', (d) => this.colorMap.get(String(d[0])))
      .attr('r', Constants.POINT_RADIUS);

    circles
      .filter((d) => d[3] === true)
      .attr('data-bs-toggle', 'tooltip')
      .attr('title', (d) => d[0]);

    const texts = g
      .append('text')
      .attr('x', (d) => xScale(d.xStart + (d.xEnd - d.xStart) / 2))
      .attr('y', (d) => yScale(d.yIndex) - Constants.POINT_RADIUS - 5)
      .style('text-anchor', 'middle')
      .style('fill', textColor)
      .text((d) => d.activity);

    texts.each((a, b, c) => {
      const sel = d3.select(c[b]);
      const xStart = xScale(a.xStart);
      const xEnd = xScale(a.xEnd);
      this.wrapInnerLabelText(
        sel,
        sel.text(),
        xEnd - xStart - 2 * Constants.POINT_RADIUS
      );
    });

    const maxYIndex = Math.max(...dataArray.map((d) => d.yIndex));

    this.svg.attr(
      'height',
      (maxYIndex + 1) * Constants.LEAF_HEIGHT + 4 * Constants.POINT_RADIUS
    );
    this.svg.attr(
      'width',
      this._variant.subvariant.length * intervalWidth +
        2 * Constants.POINT_RADIUS
    );

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

  private buildData(): Map<string, SubvariantVisualization> {
    const intervalWidth = Constants.INTERVAL_LENGTH;
    const gapLength = (20 + Constants.POINT_RADIUS) / intervalWidth;

    let usedYIndices = new Set<number>();
    const starts = new Map<string, [number, number]>();
    const data = new Map<string, SubvariantVisualization>();
    let xIndex = 0;
    this._variant.subvariant.forEach((group) => {
      let starting = group.filter(
        (subvariantNode) => subvariantNode.lifecycle === 'start'
      );
      let completing = group.filter(
        (subvariantNode) => subvariantNode.lifecycle === 'complete'
      );

      starting.forEach((subvariantNode) => {
        let yIndex = this.getNextFreeYIndex(usedYIndices);
        usedYIndices.add(yIndex);

        starts[subvariantNode.activity + subvariantNode.activity_instance] = [
          xIndex,
          yIndex,
        ];
      });

      completing.forEach((subvariantNode) => {
        let startIndices =
          starts[subvariantNode.activity + subvariantNode.activity_instance];

        let m = new SubvariantVisualization();
        m.activity = subvariantNode.activity;
        m.performanceStats = subvariantNode.performance_stats;
        m.xStart = startIndices[0];
        m.xEnd = xIndex;
        m.yIndex = startIndices[1];

        data.set(subvariantNode.activity + subvariantNode.activity_instance, m);

        usedYIndices.delete(startIndices[1]);

        starts.delete(
          (subvariantNode.activity, subvariantNode.activity_instance)
        );
      });

      const nRunning = Array.from(starts.values()).length;
      if (nRunning <= 0) {
        xIndex += gapLength;
      } else {
        xIndex += 1;
      }
    });

    return data;
  }

  private getNextFreeYIndex(usedYIndices: Set<number>): number {
    let index = 0;
    while (true) {
      if (usedYIndices.has(index)) {
        index++;
        continue;
      }

      return index;
    }
  }

  public setExpanded(expanded: boolean): void {
    this.expanded = expanded;
    this.draw();
  }

  public toggleExpanded() {
    this.expanded = !this.expanded;
    this.draw();
  }

  public performanceModeChanged(mode: boolean) {
    this.isPerformanceMode = mode;
    this.draw();
  }
}
