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
import { VariantPerformanceService } from 'src/app/services/variant-performance.service';

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
  public serviceTimeColorMap: any;
  public waitingTimeColorMap: any;

  constructor(
    private sharedDataService: SharedDataService,
    private colorMapService: ColorMapService,
    private tooltipService: ActivateTooltipsService,
    private variantPerformanceService: VariantPerformanceService
  ) {}

  ngAfterViewInit(): void {
    this.svg = d3.select(this.svgElement.nativeElement);
    this.isLoaded = true;

    this.colorMapService.colorMap$.subscribe((cMap) => {
      this.colorMap = cMap;
      if (this._variant) {
        this.draw();
      }
    });

    this.variantPerformanceService.serviceTimeColorMap.subscribe((colorMap) => {
      if (colorMap !== undefined) {
        this.serviceTimeColorMap = colorMap;
        this.draw();
      }
    });

    this.variantPerformanceService.waitingTimeColorMap.subscribe((colorMap) => {
      if (colorMap !== undefined) {
        this.waitingTimeColorMap = colorMap;
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
    let dataArray = Array.from(data.values());

    if (this.isPerformanceMode) {
      dataArray = dataArray.concat(this.buildWaitingTimeData(data));
    }
    const xScale = (x) => Constants.POINT_RADIUS + x * intervalWidth;
    const yScale = (y) =>
      4 * Constants.POINT_RADIUS + y * Constants.LEAF_HEIGHT * 1.5;

    const g = this.svg.selectAll().data(dataArray).join('g');

    g.append('line')
      .style('stroke', (d) => this.computeActivityColor(d))
      .attr('x1', (d) => xScale(d.xStart))
      .attr('x2', (d) => xScale(d.xEnd))
      .attr('y1', (d) => yScale(d.yIndex))
      .attr('y2', (d) => yScale(d.yIndex))
      .attr('stroke-width', (_) => 2 * Constants.POINT_RADIUS)
      .on('click', (_, d) =>
        this.variantPerformanceService.setPerformanceStatsSelectedVariantElement(
          d.performanceStats,
          !d.isWaitingTimeNode
        )
      );

    const circles = g
      .selectAll('circle')
      .data((d) => {
        const color = this.computeActivityColor(d);
        if (d.xStart == d.xEnd) {
          return [[d, d.xStart, true, color]];
        }
        return [
          [d, d.xStart, false, color],
          [d, d.xEnd, false, color],
        ];
      })
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d[1]))
      .attr('cy', (d) => yScale(d[0].yIndex))
      .attr('fill', (d) => d[3])
      .attr('r', Constants.POINT_RADIUS)
      .on('click', (_, d) =>
        this.variantPerformanceService.setPerformanceStatsSelectedVariantElement(
          d[0].performanceStats,
          !d[0].isWaitingTimeNode
        )
      );

    circles
      .filter((d) => d[2] === true)
      .attr('data-bs-toggle', 'tooltip')
      .attr('title', (d) => d[0].activity);

    const texts = g
      .append('text')
      .filter((d) => !d.isWaitingTimeNode)
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

  private computeActivityColor(subvariantData: SubvariantVisualization) {
    if (!this.isPerformanceMode) {
      return this.colorMap.get(subvariantData.activity);
    }
    if (!subvariantData.isWaitingTimeNode) {
      let stat = this.variantPerformanceService.serviceTimeStatistic;
      return this.serviceTimeColorMap(subvariantData.performanceStats[stat]);
    }

    let stat = this.variantPerformanceService.waitingTimeStatistic;
    return this.waitingTimeColorMap(subvariantData.performanceStats[stat]);
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
        m.isWaitingTimeNode = false;

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

  private buildWaitingTimeData(
    nodesData: Map<string, SubvariantVisualization>
  ): SubvariantVisualization[] {
    let result = [];

    this._variant.waiting_time_events.forEach((waitingTimeEvent) => {
      console.log(waitingTimeEvent);
      let xStart = 0;
      let xEnd = 0;
      let yIndex = 0;
      if (waitingTimeEvent.start.lifecycle == 'start') {
        xStart = nodesData.get(
          waitingTimeEvent.start.activity +
            waitingTimeEvent.start.activity_instance
        ).xStart;
      } else {
        xStart = nodesData.get(
          waitingTimeEvent.start.activity +
            waitingTimeEvent.start.activity_instance
        ).xEnd;
      }
      if (waitingTimeEvent.complete.lifecycle == 'start') {
        xEnd = nodesData.get(
          waitingTimeEvent.complete.activity +
            waitingTimeEvent.complete.activity_instance
        ).xStart;
      } else {
        xEnd = nodesData.get(
          waitingTimeEvent.complete.activity +
            waitingTimeEvent.complete.activity_instance
        ).xEnd;
      }
      yIndex = nodesData.get(
        waitingTimeEvent.complete.activity +
          waitingTimeEvent.complete.activity_instance
      ).yIndex;

      let m = new SubvariantVisualization();
      m.activity = 'WAITING TIME NODE';
      m.performanceStats = waitingTimeEvent.performance_stats;
      m.xStart = xStart + 0.3;
      m.xEnd = xEnd - 0.3;
      m.yIndex = yIndex;
      m.isWaitingTimeNode = true;

      result.push(m);
    });

    return result;
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
