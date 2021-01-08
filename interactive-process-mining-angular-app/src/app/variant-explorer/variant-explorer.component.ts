import {AfterViewInit, Component, ElementRef, isDevMode, OnInit, ViewChild} from '@angular/core';
import * as d3 from 'd3';
import * as dummyBackendResponse from './dummy_backend_data.js';
import {ColorMapService} from "../services/colorMapService/color-map.service";
import {SharedDataService} from "../services/sharedDataService/shared-data.service";
import {BackendService} from "../services/backendService/backend.service";

import * as helperFunctions from "./helper_functions"
import {ActivateTooltipsService} from "../services/activateTooltipsService/activate-tooltips.service";
import * as constants from "./constants";

@Component({
  selector: 'app-variant-explorer',
  templateUrl: './variant-explorer.component.html',
  styleUrls: ['./variant-explorer.component.css']
})
export class VariantExplorerComponent implements OnInit {

  constructor(private colorMapService: ColorMapService,
              private sharedDataService: SharedDataService,
              private backendService: BackendService,
              private tooltipActivationService: ActivateTooltipsService) {
  }


  dummyBackendResponse: any[] = dummyBackendResponse.test;
  colorMap: Map<string, string>;

  public variantsLoading: boolean;

  private polygonDimensionWidth = 0;

  variants: any[];
  selectedVariants: any[] = [];

  d3jsData;

  ngOnInit() {
    if (isDevMode()) {
      console.log("devMode active -> load dummy data");
      console.log(this.dummyBackendResponse);
      this.variants = this.dummyBackendResponse['variants'];
      this.colorMap = this.colorMapService.getColorMap(this.dummyBackendResponse['activities']);
      this.selectedVariants = [];
      this.setPolygonDimensionWidth(constants.polygonFoldingWidth);
      this.createChart();
      this.tooltipActivationService.activate();
    }

    this.sharedDataService.loadedEventLog$.subscribe(eventLog => {
      if (eventLog) {
        this.backendService.getVariantsFromEventLog().subscribe(res => {
          this.colorMap = this.colorMapService.getColorMap(res['activities']);
          this.variants = res['variants'];
          this.setPolygonDimensionWidth(constants.polygonFoldingWidth);
          this.createChart();
          this.tooltipActivationService.activate();
        });
      }
    });
  }

  updateAlignments() {
    //console.log(this.variants);
    this.variants.forEach(v => {
      v['calculationInProgress'] = true;
      this.backendService.calculateAlignment(v).subscribe(res => {
        //console.log(res);
        v['calculationInProgress'] = false;
        v['alignment'] = res['alignment'];
        v['deviation'] = res['deviation'];
      });
    })

  }


  discover_initial_model() {
    this.backendService.discoverProcessModelFromVariants(this.selectedVariants);
  }

  clearSelection() {
    this.selectedVariants.forEach(d => {
      this.foldingTrace(d['value'], d['i']);
    });
    this.selectedVariants = [];
  }

  private createChart(): void {
    this.selectedVariants = [];
    d3.select('#chart').select('svg').remove();
    this.d3jsData = this.variants;
    this.d3jsData = this.d3jsData.map((d, i) => ({value: d, i: i}))
    const chartDiv = d3.select('#chart').append('svg')
      .attr('id', 'SVGcontainer');

    const g = chartDiv.selectAll('g')
      .data(this.d3jsData)
      .enter()
      .append('svg:g')
      .attr('num-events', (d) => d['value'].events.length)
      .attr('transform', (d, i) => 'translate(0, ' + (i * 40 + 20) + ')')
      .on('click', (e, d) => {
        if (this.selectedVariants.includes(d)) { // click already selected variants
          // @ts-ignore
          this.selectedVariants = this.selectedVariants.filter(variant => d !== variant)
          // @ts-ignore
          this.foldingTrace(d.value, d.i);                // folding trace graph
        } else {
          // @ts-ignore
          this.selectedVariants.push(d);
          // @ts-ignore
          this.expandingTrace(d.value, d.i);
        }
      })
      .attr('class', 'svg-trace');

    g.selectAll('polygon')
      .data(d => d['value'].events.map((d, i) => ({value: d, i: i})))
      .enter()
      .append('svg:polygon')
      .attr('points', (d, i) => this.getTracePoints(i))
      .style('fill', (d, i) => this.colorMap.get(d['value']))
      .attr('transform', (d, i) => 'translate(' + i * (this.polygonDimensionWidth + constants.polygonDimensionSpacing) + ', 0)')
      .classed('cursor-pointer', true)
      .on('mouseover', this.mouseOverPolygon)
      .on('mouseout', this.mouseOutPolygon);

    // @ts-ignore
    g.selectAll('text')
      .data(d => d['value'].events.map((d, i) => ({value: d, i: i})))
      .enter()
      .append('text')
      .classed('svg-text', true)
      .attr('y', -4)
      .text(d => d['value'])
      .attr('transform', (d, i) => 'translate(' + i * (this.polygonDimensionWidth + constants.polygonDimensionSpacing) + ', 0)')
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
    //console.log("setPolygonDimensionWidth ", w)
    this.polygonDimensionWidth = w;
  }

  private getTracePoints(i) {
    //calculate chevron
    const points = [];
    points.push('0,0');
    points.push(this.polygonDimensionWidth + ',0');
    points.push(this.polygonDimensionWidth + constants.polygonDimensionTailWidth + ',' + (constants.polygonDimensionHeight / 2));
    points.push(this.polygonDimensionWidth + ',' + constants.polygonDimensionHeight);
    points.push('0,' + constants.polygonDimensionHeight);
    if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
      points.push(constants.polygonDimensionTailWidth + ',' + (constants.polygonDimensionHeight / 2));
    }
    return points.join(' ');
  }

  private foldingTrace(d, i) {
    this.setPolygonDimensionWidth(constants.polygonFoldingWidth);
    const prev_g = d3.select('#chart').selectAll('g').filter((d, j) => j === i);
    prev_g.selectAll('polygon').remove();
    // remove dashed selection box
    prev_g.selectAll('rect').remove();
    prev_g.selectAll('polygon')
      .data(d => d['value'].events.map((d, i) => ({value: d, i: i})))
      .enter()
      .append('svg:polygon')
      .attr('points', (d, i) => this.getTracePoints(i))
      .style('fill', (d, i) => this.colorMap.get(d['value']))
      .attr('transform', (d, i) => 'translate(' + i * (this.polygonDimensionWidth + constants.polygonDimensionSpacing) + ', 0)')
      .classed('cursor-pointer', true)
      .on('mouseover', this.mouseOverPolygon)
      .on('mouseout', this.mouseOutPolygon);
    prev_g.selectAll('text').remove();

    prev_g.selectAll('text')
      .data(d => d['value'].events.map((d, i) => ({value: d, i: i})))
      .enter()
      .append('text')
      .classed('svg-text', true)
      .attr('y', -4)
      .text(d => d['value'])
      .attr('transform', (d, i) => 'translate(' + i * (this.polygonDimensionWidth + constants.polygonDimensionSpacing) + ', 0)')
      .attr('visibility', 'hidden')

    // @ts-ignore
    prev_g.attr('width', (this.polygonDimensionWidth + constants.polygonDimensionSpacing) * prev_g.attr('num-events'));
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
    let positionX = 4; //4 because of dashed rectangle, otherwise 0
    const g = d3.select('#chart').selectAll('g').filter((d, j) => j === i);
    g.selectAll('polygon').remove();
    g.selectAll('text').remove();
    // remove dashed selection box
    g.selectAll('rect').remove();
    let overall_length = 0;
    // @ts-ignore
    g.selectAll('polygon')
      .data((d) => {
        // @ts-ignore
        return d.value.events;
      })
      .enter()
      .append('svg:polygon')
      .style('fill', (d: string, i) => this.colorMap.get(d))
      .classed('cursor-pointer', true)
      .each((d, i) => {
        if (i > 0) {
          positionX = positionX + this.polygonDimensionWidth + constants.polygonDimensionSpacing
        }
        // @ts-ignore
        this.setPolygonWidthByLengthOfEvent(d);
        overall_length = overall_length + this.polygonDimensionWidth + constants.polygonDimensionSpacing;
        g.selectAll('polygon').filter((d, j) => j === i)
          .attr('points', this.getTracePoints(i))
          .attr('transform', 'translate(' + positionX + ', 0)')
      });
    g.attr('width', overall_length);

    positionX = 4;//4 because of dashed rectangle, otherwise 0
    // @ts-ignore
    g.selectAll('text')
      .data(d => {
        return d['value'].events;
      })
      .enter()
      .append('text')
      .attr('x', 10)
      .attr('y', 17)
      .text(d => d)
      .classed('svg-text-variant-explorer-no-color cursor-pointer', true)
      .attr('fill', (d: string) => helperFunctions.isDarkColor(this.colorMap.get(d)) ? 'white' : 'black')
      .each((d, i) => {
        if (i > 0) {
          positionX = positionX + this.polygonDimensionWidth + constants.polygonDimensionSpacing
        }
        // @ts-ignore
        const textLength = g.selectAll('text').filter((d, j) => j === i).node().getComputedTextLength();
        //console.log(textLength);
        // @ts-ignore
        this.setPolygonWidthByLengthOfEvent(d);
        g.selectAll('text').filter((d, j) => j === i)
          .attr('transform', 'translate(' + positionX + ', 0)');
      });
    // add blue selection box around selected variant
    // @ts-ignore
    const bbox = g.node().getBBox();
    g.append("rect")
      .attr("width", bbox.width + 4)
      .attr("height", bbox.height + 4)
      .attr("x", bbox.x - 2)
      .attr("y", bbox.y - 2)
      .style("fill", "transparent")
      .style("stroke", "var(--text-secondary)")
      .style("stroke-width", "2px")
      .style("stroke-dasharray", '2')
    this.resizeSVG();
  }

  private setPolygonWidthByLengthOfEvent(d: string) {
    //console.log(d)
    const width = this.measureStringOnCanvas(d);
    this.setPolygonDimensionWidth(width);
  }

  private measureStringOnCanvas(str: string): number {
    // TODO simplify calculation of width
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = '1rem Segoe UI';
    return Math.round(ctx.measureText(str).width);
  }

  private resizeSVG() {
    const svg = document.getElementById("SVGcontainer");
    // @ts-ignore
    const bbox = svg.getBBox();
    // Update the width and height using the size of the contents
    svg.setAttribute("width", bbox.x + bbox.width + bbox.x + 4);
    svg.setAttribute("height", bbox.y + bbox.height + bbox.y + 4);
  }
}
