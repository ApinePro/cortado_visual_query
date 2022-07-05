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

  @Input()
  onClickCbFc: (SubvariantVisualization) => void;

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

    this.variantPerformanceService.variantPerformanceMode.subscribe(
      (isPerformanceModeActive: boolean) => {
        this.isPerformanceMode = isPerformanceModeActive;
        this.draw();
      }
    );
  }

  draw(textColor: string = 'whitesmoke'): void {
    const intervalWidth = !this.expanded
      ? Constants.INTERVAL_LENGTH
      : Constants.INTERVAL_LENGTH * 1.5;

    this.svg.selectAll('g').remove();
    this.svg.selectAll('rect').remove();
    this.svg.selectAll('line').remove();

    const [data, xValues] = this.buildData();
    let dataArray = Array.from(data.values());

    const xScale = (x) => Constants.POINT_RADIUS + x * intervalWidth + 5;
    const yScale = (y) =>
      4 * Constants.POINT_RADIUS + y * Constants.LEAF_HEIGHT * 1.5;

    const maxYIndex = Math.max(...dataArray.map((d) => d.yIndex));
    const maxXEnd = Math.max(...dataArray.map((d) => d.xEnd));

    const height = yScale(maxYIndex + 1);
    const width = xScale(maxXEnd) + Constants.POINT_RADIUS + 5;

    this.svg.attr('height', height);
    this.svg.attr('width', width);

    const helpLineOpacity = this.isPerformanceMode ? 0.1 : 0.04;

    this.svg
      .selectAll('line')
      .data(xValues)
      .enter()
      .append('line')
      .attr('x1', (x) => xScale(x))
      .attr('x2', (x) => xScale(x))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', 'lightgrey')
      .attr('stroke-width', 2 * Constants.POINT_RADIUS)
      .attr('stroke-opacity', helpLineOpacity);

    if (this.isPerformanceMode) {
      dataArray = dataArray.concat(this.buildWaitingTimeData(data));

      this.svg
        .append('rect')
        .classed('subvariant-rect', true)
        .datum(() => {
          let d = new SubvariantVisualization();
          d.activity = 'GLOBAL';
          d.performanceStats = this._variant.global_performance_stats;

          return d;
        })
        .style('fill', (d) => 'lightgrey')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .attr('fill-opacity', 0.5)
        .attr('rx', 8)
        .attr('ry', 8)
        .on('click', (_, d) => {
          if (this.onClickCbFc) {
            this.onClickCbFc(d);
          }

          this.variantPerformanceService.setPerformanceStatsSelectedVariantElement(
            d.performanceStats,
            !d.isWaitingTimeNode
          );
        });
    }

    const g = this.svg.selectAll().data(dataArray).join('g');

    g.append('rect')
      .classed('subvariant-rect', true)
      .style('fill', (d) => this.computeActivityColor(d))
      .attr('x', (d) => xScale(d.xStart) - Constants.POINT_RADIUS)
      .attr('y', (d) => yScale(d.yIndex) - Constants.POINT_RADIUS)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr(
        'width',
        (d) => xScale(d.xEnd) - xScale(d.xStart) + 2 * Constants.POINT_RADIUS
      )
      .attr('height', Constants.POINT_RADIUS * 2)
      .attr('data-bs-toggle', (d) => {
        if (d.isWaitingTimeNode) return null;
        return 'tooltip';
      })
      .attr('title', (d) => d.activity)
      .on('click', (_, d) => {
        if (this.onClickCbFc) {
          this.onClickCbFc(d);
        }

        this.variantPerformanceService.setPerformanceStatsSelectedVariantElement(
          d.performanceStats,
          !d.isWaitingTimeNode
        );
      });

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

  private buildData(): [Map<string, SubvariantVisualization>, Set<number>] {
    const intervalWidth = Constants.INTERVAL_LENGTH;
    const gapLength = (20 + Constants.POINT_RADIUS) / intervalWidth;

    let xValues = new Set<number>();
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

        xValues.add(m.xStart);
        xValues.add(m.xEnd);

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

    return [data, xValues];
  }

  private buildWaitingTimeData(
    nodesData: Map<string, SubvariantVisualization>
  ): SubvariantVisualization[] {
    let result = [];

    this._variant.waiting_time_events.forEach((waitingTimeEvent) => {
      let xStart = 0;
      let xEnd = 0;
      let yIndex = 0;

      let startActivityData = nodesData.get(
        waitingTimeEvent.start.activity +
          waitingTimeEvent.start.activity_instance
      );
      let completeActivityData = nodesData.get(
        waitingTimeEvent.complete.activity +
          waitingTimeEvent.complete.activity_instance
      );

      if (waitingTimeEvent.start.lifecycle == 'start') {
        xStart = startActivityData.xStart;
      } else {
        xStart = startActivityData.xEnd + 0.2;
      }
      if (waitingTimeEvent.complete.lifecycle == 'start') {
        xEnd = completeActivityData.xStart - 0.2;
      } else {
        xEnd = completeActivityData.xEnd;
      }

      if (waitingTimeEvent.anchor == 'start') {
        yIndex = startActivityData.yIndex;
      } else {
        yIndex = completeActivityData.yIndex;
      }

      let m = new SubvariantVisualization();
      m.activity = 'WAITING TIME NODE';
      m.performanceStats = waitingTimeEvent.performance_stats;
      m.xStart = xStart;
      m.xEnd = xEnd;
      m.yIndex = yIndex;
      m.isWaitingTimeNode = true;

      result.push(m);
    });

    // find duplicates in x-positions between Waiting Time Nodes and Subvariant Nodes; then, introduce gaps
    const yData = this.getSubvariantVisualizationsXPositionMapPerYIndex(
      Array.from(nodesData.values())
    );

    for (let [i, wtEvent] of result.entries()) {
      if (yData.get(wtEvent.yIndex).indexOf(wtEvent.xStart) > -1) {
        result[i].xStart += 0.2;
      }

      if (yData.get(wtEvent.yIndex).indexOf(wtEvent.xEnd) > -1) {
        result[i].xEnd -= 0.2;
      }
    }

    // handle remaining overlapping waiting time events
    for (let r1 of result) {
      for (let [j, r2] of result.entries()) {
        if (r1 === r2) {
          continue;
        }

        if (r1.y != r2.y) {
          continue;
        }

        if (r1.xEnd === r2.xStart) {
          result[j].xStart += 0.2;
        }
      }
    }

    return result;
  }

  private getSubvariantVisualizationsXPositionMapPerYIndex(
    data: SubvariantVisualization[]
  ): Map<number, number[]> {
    const yData = new Map<number, number[]>();
    data.forEach((subvariant: SubvariantVisualization) => {
      if (!yData.has(subvariant.yIndex)) {
        yData.set(subvariant.yIndex, []);
      }

      let yDataForIndex = yData.get(subvariant.yIndex);
      yDataForIndex.push(subvariant.xStart);
      yDataForIndex.push(subvariant.xEnd);
      yData.set(subvariant.yIndex, yDataForIndex);
    });

    return yData;
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

  changeSelection(sel: SubvariantVisualization) {
    d3.selectAll('.subvariant-rect').classed(
      'selected-subvariant',
      (d) => sel === d
    );
  }
}
