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
      //this.draw();
    });
  }

  draw(textColor: string = 'whitesmoke'): void {
    const intervalWidth = !this.expanded
      ? Constants.INTERVAL_LENGTH
      : Constants.INTERVAL_LENGTH * 1.5;
    this.svg.selectAll('g').remove();
    const data = this.buildData();
    const xScale = (x) => Constants.POINT_RADIUS + x * intervalWidth;
    const yScale = (y) =>
      4 * Constants.POINT_RADIUS + y * Constants.LEAF_HEIGHT * 1.5;

    console.log(data);
    const g = this.svg.selectAll().data(data).join('g');

    g.append('line')
      .style('stroke', (d) => this.colorMap.get(d[0]))
      .attr('x1', (d) => xScale(d[1]))
      .attr('x2', (d) => xScale(d[2]))
      .attr('y1', (d) => yScale(d[3]))
      .attr('y2', (d) => yScale(d[3]))
      .attr('stroke-width', (_) => 2 * Constants.POINT_RADIUS);

    let circles_data = [];
    data.forEach((d) => {
      if (d[1] == d[2]) {
        circles_data.push([d[0], d[1], d[3], true]);
      } else {
        circles_data.push([d[0], d[1], d[3], false]);
        circles_data.push([d[0], d[2], d[3], false]);
      }
    });

    const circles = g
      .selectAll('circle')
      .data(circles_data)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d[1]))
      .attr('cy', (d) => yScale(d[2]))
      .attr('fill', (d) => this.colorMap.get(d[0]))
      .attr('r', Constants.POINT_RADIUS);

    circles
      .filter((d) => d[3] === true)
      .attr('data-bs-toggle', 'tooltip')
      .attr('title', (d) => d[0]);

    const texts = g
      .append('text')
      .attr('x', (d) => xScale(d[1] + (d[2] - d[1]) / 2))
      .attr('y', (d) => yScale(d[3]) - Constants.POINT_RADIUS - 5)
      .style('text-anchor', 'middle')
      .style('fill', textColor)
      .text((d) => d[0]);

    texts.each((a, b, c) => {
      const sel = d3.select(c[b]);
      const xStart = xScale(a[1]);
      const xEnd = xScale(a[2]);
      this.wrapInnerLabelText(
        sel,
        sel.text(),
        xEnd - xStart - 2 * Constants.POINT_RADIUS
      );
    });

    const maxYIndex = Math.max(...data.map((d) => d[3]));

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

  private buildData(): any[] {
    const intervalWidth = Constants.INTERVAL_LENGTH;
    const gapLength = (20 + Constants.POINT_RADIUS) / intervalWidth;

    let usedYIndices = new Set<number>();
    const starts = new Map<string, [number, number]>();
    const data = [];
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

        data.push([
          subvariantNode.activity,
          startIndices[0],
          xIndex,
          startIndices[1],
        ]);

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
}
