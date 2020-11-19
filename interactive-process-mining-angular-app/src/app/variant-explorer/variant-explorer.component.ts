import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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
  isVisibleCaseEventsExplorer: boolean = false;
  colorMap: Map<string, string>;


  public colorMapKeys: string[] = [];
  public variantsLoading: boolean;

  public polygonFoldingWidth = 25;
  polygonDimensionWidth = 0;
  polygonDimensionHeight = 23;
  polygonDimensionSpacing = 3;
  polygonDimensionTailWidth = 6;

  variants: any[];
  selectedVariants: string[];


  constructor() {
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
    console.warn(data);

    const chartDiv = d3.select('#chart').append('svg')
      .attr('id', 'SVGcontainer');

    const g = chartDiv.selectAll('g')
      .data(data)
      .enter()
      .append('svg:g')
      .attr('num-events', (d) => d.value.events.length)
      .attr('transform', (d, i) => 'translate(0, ' + (i * 40 + 20) + ')')
      .on('click', (e, d) => {
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
      .attr('y', 20)
      .attr('dy', '-1.8em')
      .text(d => d['value'])
      .attr('transform', (d, i) => 'translate(' + i * (this.polygonDimensionWidth + this.polygonDimensionSpacing) + ', 0)')
      .attr('visibility', 'hidden')

    this.resizeSVG();
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
    this.resizeSVG();
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
      .attr('y', 17)
      .text((d) => d)
      .classed('svg-text',true)
      .each((d, i) => {
        if (i > 0) {
          positionX = positionX + this.polygonDimensionWidth + this.polygonDimensionSpacing
        }
        // @ts-ignore
        this.setPolygonWidthByLengthOfEvent(d);
        g.selectAll('text').filter((d, j) => j === i)
          .attr('transform', 'translate(' + positionX + ', 0)');
      })
    this.resizeSVG();
  }

  private setPolygonWidthByLengthOfEvent(event: string) {
    console.log(event)
    const width = this.measureStringOnCanvas(event);
    this.setPolygonDimensionWidth(width);
  }

  private measureStringOnCanvas(str: string): number {
    // TODO simplify calculation of width
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = '1rem Rubik';
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

  private resizeSVG() {
    const  svg = document.getElementById("SVGcontainer");
    // @ts-ignore
    var  bbox = svg.getBBox();
    // Update the width and height using the size of the contents
    svg.setAttribute("width", bbox.x + bbox.width + bbox.x);
    svg.setAttribute("height", bbox.y + bbox.height + bbox.y);
  }



}
