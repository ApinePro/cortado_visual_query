import { AfterViewInit, ElementRef } from '@angular/core';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { Selection, thresholdFreedmanDiaconis } from 'd3';
import { getPolygonPoints } from '../helper_functions';
import { Constants, LeafNode, ParallelGroup, SequenceGroup, VariantElement } from '../model';

@Component({
  selector: 'app-variant-fragment',
  templateUrl: './variant-fragment.component.html',
  styleUrls: ['./variant-fragment.component.css']
})
export class VariantFragmentComponent implements AfterViewInit {

  constants = Constants;

  constructor() { 
  }

  @ViewChild("svg")
  svgHtmlElement!: ElementRef;

  @Input()
  content: VariantElement = new ParallelGroup([new SequenceGroup([new LeafNode("a"), new LeafNode("b"), new LeafNode("c")]), new ParallelGroup([new LeafNode("a"), new LeafNode("b")])]);

  @Input()
  colorMap: Map<string, string>;

  svgSelection!: Selection<any, any, any, any>;

  contentJSON = '{"parallel": [{"leaf": "F"}, {"follows": [{"parallel": [{"leaf": "A"}, {"follows": [{"leaf": "B"}, {"leaf": "C"}]}]}, {"leaf": "D"}]}]}';
  // contentJSON = '{"follows": [{"leaf": "B"}, {"leaf": "C"}]}';
  // contentJSON = '{"parallel": [{"leaf": "B"}, {"leaf": "C"}]}';

  deserializeJSON(json: string) {
    this.content = this.deserialize(JSON.parse(json));
  }

  deserialize(obj: any): VariantElement {
    if('follows' in obj) {
      return new SequenceGroup(obj['follows'].map((e: any) => this.deserialize(e)))
    } else if('parallel' in obj) {
      return new ParallelGroup(obj['parallel'].map((e: any) => this.deserialize(e)))
    } else {
      return new LeafNode(obj['leaf']);
    }
  }

  ngAfterViewInit(): void {
    this.svgSelection = d3.select(this.svgHtmlElement.nativeElement)
                .append('g')
                // .attr("transform", "translate(0 15)")
                .on('click', () => {
                  this.content.setExpanded(!this.content.expanded);
                  this.redraw();
                });
    
    this.redraw();
  }

  redraw() {
    let height = this.content.recalculateHeight();
    let width = this.content.recalculateWidth();
    this.content.updateWidth();

    d3.select(this.svgHtmlElement.nativeElement)
      .attr('width', width)
      .attr('height', height);

    this.svgSelection.selectAll("*").remove();

    let svg = this.svgSelection
                .attr('width', width)
                .attr('height', height);
    
    console.time("draw");
    this.draw(this.content, svg);
    console.timeEnd("draw");

    if(this.content instanceof SequenceGroup) {
      this.svgSelection.select('polygon').remove();
    }
  }

  draw(element: VariantElement, svgElement: any) {
    if (element instanceof ParallelGroup) {
      this.drawParallelGroup(element.asParallelGroup(), svgElement);
    } else if(element instanceof SequenceGroup) {
      this.drawSequenceGroup(element.asSequenceGroup(), svgElement);
    } else if(element instanceof LeafNode) {
      VariantFragmentComponent.drawLeafNode(element.asLeafNode(), svgElement, this.colorMap);
    }
  }

  drawSequenceGroup(element: SequenceGroup, parent: any) {
    let width = element.getWidth();
    let height = element.getHeight();

    let polygonPoints = getPolygonPoints(width, height);

    let color = this.getColor(element);
    parent.append('polygon')
          .attr('points', polygonPoints)
          .style('fill', color)
          .style('stroke', 'black')
          .classed('variant-group-element', true)
          .classed('variant-sequence-group', true);

    let x = element.getHeadLength() + Constants.MARGIN_X - element.elements[0].getHeadLength();
    for(let child of element.elements) {
      let width = child.getWidth();
      let childHeight = child.getHeight();
      let y = height / 2 - childHeight / 2
      let g = parent.append("g")
                      .attr("transform", `translate(${x}, ${y})`)

      this.draw(child, g);
      x += width;
    } 
  }

  drawParallelGroup(element: ParallelGroup, parent: any) {
    let width = element.getWidth();
    let height = element.getHeight();
    
    let polygonPoints = getPolygonPoints(width, height);
    
    let color = this.getColor(element);
    parent.append('polygon')
          .attr('points', polygonPoints)
          .style('fill', color)
          .style('stroke', 'black')
          .classed('variant-group-element', true)
          .classed('variant-parallel-group', true);

    let y = Constants.MARGIN_Y;
    for(let child of element.elements) {
      let height = child.getHeight();

      let x = element.getHeadLength() + 0.5 * this.constants.MARGIN_X

      let g = parent.append("g")
                      .attr("transform", `translate(${x}, ${y})`)

      this.draw(child, g);
      y += height + Constants.MARGIN_Y;
    } 
  }

  public static drawLeafNode(element: LeafNode, parent: any, colorMap: Map<string, string>) {
    let width = element.getWidth();
    let height = element.getHeight();

    let polygonPoints = getPolygonPoints(width, height);

    let color = colorMap.get(element.activity);
    parent.append('polygon')
          .attr('points', polygonPoints)
          .style('fill', color)
          .style('stroke', 'black')
          // .on('mouseover', () => {
          //   hoverText.attr('visibility', 'visible')
          // })
          // .on('mouseout', () => {
          //   hoverText.attr('visibility', 'hidden')
          // });

    let activityText = parent.append("text")
          .text(element.activity)
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', Constants.FONT_SIZE)

    VariantFragmentComponent.wrapInnerLabelText(activityText, element.activity, width - 2 * Constants.MARGIN_X);

    let l = activityText.node().getComputedTextLength();
    element.textLength = l;
  }

  private static wrapInnerLabelText(textSelection: any, text: string, maxWidth: number) {
    var textLength = textSelection.node().getComputedTextLength();

    while (textLength > maxWidth && text.length > 0) {
        text = text.slice(0, -1);
        textSelection.text(text + "...");
        textLength = textSelection.node().getComputedTextLength();
    }
  }

  getColor(element: VariantElement) {
    // return '#2b2b2b'
    return 'lightgrey'
  }

  colors = d3.scaleOrdinal().domain(this.getActivities(this.content)).range(d3.schemeAccent)

  getActivityColor(activity: string) {
    return this.colors(activity);
  }

  getActivities(element: VariantElement): string[] {
    if (element instanceof ParallelGroup) {
      return element.asParallelGroup().elements.flatMap(e => this.getActivities(e));
    } else if(element instanceof SequenceGroup) {
      return element.asSequenceGroup().elements.flatMap(e => this.getActivities(e));
    } else {
      return [element.asLeafNode().activity];
    }
  }
}
