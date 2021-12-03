import { element } from 'protractor';
import {AfterViewInit, ElementRef, EventEmitter, Output} from '@angular/core';
import {Component, Input, ViewChild} from '@angular/core';
import * as d3 from 'd3';
import {Selection} from 'd3';
import {PolygonDrawingService} from 'src/app/services/polygon-drawing.service';
import {PolygonGeneratorService} from 'src/app/services/polygon-generator.service';
import {Constants, LeafNode, ParallelGroup, SequenceGroup, VariantElement} from '../model';

@Component({
  selector: 'app-variant-fragment',
  templateUrl: './variant-fragment.component.html',
  styleUrls: ['./variant-fragment.component.css']
})
export class VariantFragmentComponent implements AfterViewInit {

  constructor(private polygonService: PolygonGeneratorService,
              private polygonDrawingService: PolygonDrawingService) {
  }

  @ViewChild('svg')
  svgHtmlElement: ElementRef;

  @Input()
  variant: VariantElement;

  @Input()
  colorMap: Map<string, string>;

  @Output()
  selectVariant = new EventEmitter<VariantElement>();

  svgSelection!: Selection<any, any, any, any>;

  deserialize(obj: any): VariantElement {
    if ('follows' in obj) {
      return new SequenceGroup(obj.follows.map((e: any) => this.deserialize(e)));
    } else if ('parallel' in obj) {
      return new ParallelGroup(obj.parallel.map((e: any) => this.deserialize(e)));
    } else {
      return new LeafNode(obj.leaf);
    }
  }

  ngAfterViewInit(): void {
    this.svgSelection = d3.select(this.svgHtmlElement.nativeElement)
      .append('g')
      .on('click', () => {
        this.variant.setExpanded(!this.variant.expanded);
        this.redraw();
      });
    this.redraw();
  }

  redraw(): void {
    const height = this.variant.recalculateHeight();
    const width = this.variant.recalculateWidth();
    this.variant.updateWidth();

    d3.select(this.svgHtmlElement.nativeElement)
      .attr('width', width)
      .attr('height', height);

    this.svgSelection.selectAll('*').remove();

    const svg = this.svgSelection
      .attr('width', width)
      .attr('height', height);

    this.draw(this.variant, svg);

    if (this.variant instanceof SequenceGroup) {
      this.svgSelection.select('polygon').remove();
    }
  }

  draw(element: VariantElement, svgElement: Selection<any, any, any, any>): void {
    if (element instanceof ParallelGroup) {
      this.drawParallelGroup(element.asParallelGroup(), svgElement);
    } else if (element instanceof SequenceGroup) {
      this.drawSequenceGroup(element.asSequenceGroup(), svgElement);
    } else if (element instanceof LeafNode) {
      this.polygonDrawingService.drawLeafNode(element.asLeafNode(), svgElement, this.colorMap);
    }
  }

  drawSequenceGroup(element: SequenceGroup, parent: Selection<any, any, any, any>): void {
    const width = element.getWidth();
    const height = element.getHeight();
    const polygonPoints = this.polygonService.getPolygonPoints(width, height);
    const color = 'lightgrey';
    parent.append('polygon')
      .attr('points', polygonPoints)
      .style('fill', color)
      .style('stroke', 'none')
      .classed('variant-group-element', true)
      .classed('variant-sequence-group', true);

    let x = element.getHeadLength() + Constants.MARGIN_X - element.elements[0].getHeadLength();
    for (const child of element.elements) {
      const width = child.getWidth();
      const childHeight = child.getHeight();
      const y = height / 2 - childHeight / 2;
      const g = parent.append('g')
        .attr('transform', `translate(${x}, ${y})`);

      this.draw(child, g);
      x += width;
    }
  }

  drawParallelGroup(element: ParallelGroup, parent: Selection<any, any, any, any>): void {
    const width = element.getWidth();
    const height = element.getHeight();

    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    const color = 'lightgrey';
    parent.append('polygon')
      .attr('points', polygonPoints)
      .style('fill', color)
      //.style('stroke', color)
      //.style('stroke-opacity', .8)
      .classed('variant-group-element', true)
      .classed('variant-parallel-group', true);

    let y = Constants.MARGIN_Y;
    for (const child of element.elements) {
      const height = child.getHeight();
      const x = element.getHeadLength() + 0.5 * Constants.MARGIN_X;
      const g = parent.append('g')
        .attr('transform', `translate(${x}, ${y})`);
      this.draw(child, g);
      y += height + Constants.MARGIN_Y;
    }
  }

  onClick(): void {
    this.selectVariant.emit(this.variant);
  }

  setSelected(selected: boolean): void {
    this.variant.setExpanded(selected);
    this.redraw();
  }

  getExpanded(){
    return this.variant.getExpanded();
  }

  getSVGGraphicElement() : SVGGraphicsElement{
    return this.svgHtmlElement.nativeElement;
  }

}
