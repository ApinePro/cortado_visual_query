import {Component, OnInit} from '@angular/core';
import * as d3 from 'd3';
import * as test from './backend_response.js';

@Component({
  selector: 'app-variant-explorer',
  templateUrl: './variant-explorer.component.html',
  styleUrls: ['./variant-explorer.component.css']
})
export class VariantExplorerComponent implements OnInit {

  ngOnInit() {
    console.log(this.originVariants);
    if (this.variants !== this.originVariants) {
      this.variants = this.originVariants;
      console.log(this.variants);

      this.selectedVariants = [];
      this.setPolygonDimensionWidth(this.polygonFoldingWidth);
      this.createChart();
    }
  }

  originVariants: any[] = test.test.variants;
  isVisibleLegend: boolean = false;
  isVisibleCaseEventsExplorer: boolean = false;
  colorMap: Map<string, string>;

  /**
   * Variables for Filtering
   */
  isFilterButtonVisible: boolean;
  filteredVariants: string[];
  isOnFiltering: boolean;

  public colorMapKeys: string[] = [];
  public variantsLoading: boolean;

  public polygonFoldingWidth = 25;
  polygonDimensionWidth = 0;
  polygonDimensionHeight = 30;
  polygonDimensionSpacing = 3;
  polygonDimensionTailWidth = 10;

  variants: any[];
  selectedVariants: string[];
  currentVariant: string;
  private prevSelectedVariantIndex: number = null;

  chartWidth: number;

  constructor() {
    this.variantsLoading = false;
    this.isFilterButtonVisible = false;
    this.isOnFiltering = false;
    this.filteredVariants = [];
  }

  ngOnChanges(): void {
    if (this.colorMap == null) {
      return;
    }
    if (!this.originVariants) {
      return;
    }
    console.log(this.originVariants);
    this.colorMapKeys = Array.from(this.colorMap.keys());
    if (this.variants !== this.originVariants) {
      this.variants = this.originVariants;
      // @ts-ignore
      this.selectedVariants = [];
      this.setPolygonDimensionWidth(this.polygonFoldingWidth);
      this.createChart();
    }
  }

  private createChart(): void {
    d3.select('#chart').select('svg').remove();
    let data = this.variants;

    // set chart width
    let maxCountOfEvents = 0, maxLengthOfEventName = 0;
    data.forEach((variant) => {
      console.log(variant)
      variant['events'] = variant.variant.split(',')
      variant['percentage'] = 0
      if (variant.events.length > maxCountOfEvents) {
        maxCountOfEvents = variant.events.length;
        maxLengthOfEventName = this.measureStringOnCanvas(this.getEventNameOfMaxLength(variant.events));
      }
    });

    data = data.map((d, i) => ({value: d, i: i}))
    this.chartWidth = maxLengthOfEventName + maxCountOfEvents * (this.polygonFoldingWidth);
    console.warn(data);

    const chartDiv = d3.select('#chart').append('svg')
      .attr('width', this.chartWidth)
      .attr('height', data.length * 50 + 20)
      .attr('id', 'SVGcontainer');

    const g = chartDiv.selectAll('g')
      .data(data)
      .enter()
      .append('svg:g')
      .attr('width', (d => (this.polygonDimensionWidth + this.polygonDimensionTailWidth) * d.value.events.length))
      .attr('height', 50)
      .attr('num-events', (d) => d.value.events.length)
      .attr('transform', (d, i) => 'translate(0, ' + (i * 50 + 20) + ')')
      .on('click', (e, d) => {
        console.log(d);
        // @ts-ignore
        // @ts-ignore
        if (this.selectedVariants.includes(d.value.variant)) { // click already selected variants
          // @ts-ignore
          this.selectedVariants = this.selectedVariants.filter(variant => d.value.variant !== variant)
          // @ts-ignore
          this.foldingTrace(d.value, d.i);                // folding trace graph
        } else {
          // @ts-ignore
          this.selectedVariants.push(d.value.variant);
          // @ts-ignore
          this.expandingTrace(d.value, d.i);
        }
      })
      .attr('class', 'svg-trace');

    g.selectAll('polygon')
      .data(d => d.value.events.map((d, i) => ({value: d, i: i})))
      .enter()
      .append('svg:polygon')
      .attr('points', (d, i) => this.getTracePoints(i))
      .style('fill', (d, i) => {
        return "gray";
      })
      .attr('transform', (d, i) => 'translate(' + i * (this.polygonDimensionWidth + this.polygonDimensionSpacing) + ', 0)')
      .on('mouseover', this.mouseOverPolygon)
      .on('mouseout', this.mouseOutPolygon);

    // @ts-ignore
    g.selectAll('text')
      .data(d => d.value.events.map((d, i) => ({value: d, i: i})))
      .enter()
      .append('text')
      .classed('svg-text',true)
      .attr('x', 0)
      .attr('y', 25)
      .attr('dy', '-1.8em')
      .text(d => d['value'])
      .attr('transform', (d, i) => 'translate(' + i * (this.polygonDimensionWidth + this.polygonDimensionSpacing) + ', 0)')
      .attr('visibility', 'hidden')
      .style('fill', '#d4d4d4');
  }

  private mouseOverPolygon(e, d) {
    const index = d.i;
    // @ts-ignore
    const parentNode = d3.select(this).node().parentNode;
    d3.select(parentNode).selectAll('text').filter((d, j) => j === index)
      .attr('visibility', 'visible');
  }

  private mouseOutPolygon(e, d) {
    const index = d.i;
    // @ts-ignore
    const parentNode = d3.select(this).node().parentNode;
    d3.select(parentNode).selectAll('text').filter((d, j) => j === index)
      .attr('visibility', 'hidden');
  }

  private setPolygonDimensionWidth(w): void {
    this.polygonDimensionWidth = w;
  }

  private getTracePoints(i) {
    const points = [];
    points.push('0,0');
    points.push(this.polygonDimensionWidth + ',0');
    points.push(this.polygonDimensionWidth + this.polygonDimensionTailWidth + ',' + (this.polygonDimensionHeight / 2));
    points.push(this.polygonDimensionWidth + ',' + this.polygonDimensionHeight);
    points.push('0,' + this.polygonDimensionHeight);
    if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
      points.push(this.polygonDimensionTailWidth + ',' + (this.polygonDimensionHeight / 2));
    }
    return points.join(' ');
  }

  private foldingTrace(d, i) {
    // document.getElementById('chart').style.width = '200px';
    console.log(d)
    console.log(i)
    this.setPolygonDimensionWidth(this.polygonFoldingWidth);
    const prev_g = d3.select('#chart').selectAll('g').filter((d, j) => j === i);
    prev_g.selectAll('polygon').remove();
    // @ts-ignore
    prev_g.selectAll('polygon')
      .data((d) => {
        // @ts-ignore
        return d.value.events;
      })
      .enter()
      .append('svg:polygon')
      .attr('points', (d, i) => this.getTracePoints(i))
      .style('fill', (d, i) => {
        return "gray";
      })
      .attr('transform', (d, i) => 'translate(' + i * (this.polygonDimensionWidth + this.polygonDimensionSpacing) + ', 0)')
      .on('mouseover', this.mouseOverPolygon)
      .on('mouseout', this.mouseOutPolygon);
    prev_g.selectAll('text').remove();
    // @ts-ignore
    prev_g.selectAll('text')
      .data(d => {
        // @ts-ignore
        return d.value.events;
      })
      .enter()
      .append('text')
      .attr('x', 0)
      .attr('y', 15)
      .attr('dy', '-1.8em')
      .text((d) => d['value'])
      .attr('transform', (d, i) => 'translate(' + i * (this.polygonDimensionWidth + this.polygonDimensionSpacing) + ', 0)')
      .attr('visibility', 'hidden')
      .style('fill', '#ffffff')
      .classed('svg-text',true);
    // @ts-ignore
    prev_g.attr('width', (this.polygonDimensionWidth + this.polygonDimensionSpacing) * prev_g.attr('num-events'));
    let max = 0;
    for (let el in document.getElementsByClassName('svg-trace')) {
      if (typeof (document.getElementsByClassName('svg-trace')[el]) === 'object') {
        if (max < document.getElementsByClassName('svg-trace')[el].getBoundingClientRect().width) {
          max = document.getElementsByClassName('svg-trace')[el].getBoundingClientRect().width;
        }
      }
    }
    document.getElementById('SVGcontainer').style.width = (max * 1.2).toString() + 'px';
  }

  private expandingTrace(d, i) {
    console.log("expanding trace");
    console.log(d);
    console.log(i);
    let positionX = 0;
    const g = d3.select('#chart').selectAll('g').filter((d, j) => j === i);
    g.selectAll('polygon').remove();
    g.selectAll('text').remove();
    let overall_length = 0;
    // @ts-ignore
    g.selectAll('polygon')
      .data((d) => {
        // @ts-ignore
        return d.value.events;
      })
      .enter()
      .append('svg:polygon')
      .style('fill', (d, i) => {
          return "red";
        }
      )
      .each((d, i) => {
        if (i > 0) {
          positionX = positionX + this.polygonDimensionWidth + this.polygonDimensionSpacing
        }
        // @ts-ignore
        this.setPolygonWidthByLengthOfEvent(d);
        overall_length = overall_length + this.polygonDimensionWidth + this.polygonDimensionSpacing;
        g.selectAll('polygon').filter((d, j) => j === i)
          .attr('points', this.getTracePoints(i))
          .attr('transform', 'translate(' + positionX + ', 0)')
      });
    g.attr('width', overall_length);
    //TODO can be removed?
    if (overall_length > document.getElementById('SVGcontainer').getBoundingClientRect().width) {
      // document.getElementById('chart').style.width = (overall_length * 1.2).toString()  + 'px';
      document.getElementById('SVGcontainer').style.width = (overall_length * 1.2).toString() + 'px';
    }

    positionX = 0;
    // @ts-ignore
    // @ts-ignore
    g.selectAll('text')
      .data(d => {
        // @ts-ignore
        return d.value.events;
      })
      .enter()
      .append('text')
      .attr('x', 10)
      .attr('y', 15)
      .attr('dy', '0.35em')
      .text((d) => d)
      .each((d, i) => {
        if (i > 0) {
          positionX = positionX + this.polygonDimensionWidth + this.polygonDimensionSpacing
        }
        // @ts-ignore
        this.setPolygonWidthByLengthOfEvent(d);
        g.selectAll('text').filter((d, j) => j === i)
          .attr('transform', 'translate(' + positionX + ', 0)');
      })
  }

  private setPolygonWidthByLengthOfEvent(event: string) {
    console.log(event)
    const width = this.measureStringOnCanvas(event);
    this.setPolygonDimensionWidth(width);
  }

  private measureStringOnCanvas(str: string): number {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = '1.2rem Rubik';
    return Math.round(ctx.measureText(str).width);
  }

  private getEventNameOfMaxLength(events: string[]): string {
    let max = 0;
    let maxEvent: string = events[0];
    events.forEach((event) => {
      if (event.length > max) {
        max = event.length;
        maxEvent = event;
      }
    });
    return maxEvent;
  }


  sortedByPercentage(array: string[]): string[] {
    var sortedArray: string[] = array;
    sortedArray.sort((a, b) => {
      const variantA = this.variants.find((variant) => variant['variant'] === a);
      const variantB = this.variants.find((variant) => variant['variant'] === b);
      return variantB.percentage - variantA.percentage;
    });
    return sortedArray;
  }


  adjustChartDivWidth() {
    let chatBoxDiv = document.getElementById('chartBox');
    if (!this.isVisibleCaseEventsExplorer) {
      chatBoxDiv.classList.add('col-lg-12');
    } else {
      if (chatBoxDiv.classList.contains('col-lg-12')) {
        chatBoxDiv.classList.remove('col-lg-12');
      }
    }
  }

}
