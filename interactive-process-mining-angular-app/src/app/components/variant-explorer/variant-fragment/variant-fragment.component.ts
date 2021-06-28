import { AfterViewInit, ElementRef } from '@angular/core';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { Selection } from 'd3';
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
    let width = this.content.getWidth();
    let height = this.content.getHeight();

    this.svgSelection = d3.select(this.svgHtmlElement.nativeElement)
                .attr('width', width)
                .attr('height', height + 15)
                .append('g')
                .attr("transform", "translate(0 15)")
                .on('click', () => {
                  this.content.setExpanded(!this.content.expanded);
                  this.redraw();
                });
    this.draw(this.content, this.svgSelection)
  }

  redraw() {
    let width = this.content.getWidth();
    let height = this.content.getHeight();

    d3.select(this.svgHtmlElement.nativeElement)
      .attr('width', width)
      .attr('height', height + 15);

    this.svgSelection.selectAll("*").remove();

    let svg = this.svgSelection
                .attr('width', width)
                .attr('height', height);

    this.draw(this.content, svg);
  }

  draw(element: VariantElement, svgElement: any) {
    if (element instanceof ParallelGroup) {
      this.drawParallelGroup(element.asParallelGroup(), svgElement);
    } else if(element instanceof SequenceGroup) {
      this.drawSequenceGroup(element.asSequenceGroup(), svgElement);
    } else if(element instanceof LeafNode) {
      this.drawLeafNode(element.asLeafNode(), svgElement);
    }
  }

  drawSequenceGroup(element: SequenceGroup, parent: any) {
    let width = element.getWidth();
    let height = element.getHeight();

    let polygonPoints = this.getPolygonPoints(width, height);

    let color = this.getColor(element);
    parent.append('polygon')
          .attr('points', polygonPoints)
          .style('fill', color)
          .style('stroke', 'black');

    let x = Constants.MARGIN_X;

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

    let polygonPoints = this.getPolygonPoints(width, height);

    let color = this.getColor(element);
    parent.append('polygon')
          .attr('points', polygonPoints)
          .style('fill', color)
          .style('stroke', 'black');

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

  drawLeafNode(element: LeafNode, parent: any) {
    let width = element.getWidth();
    let height = element.getHeight();

    let polygonPoints = this.getPolygonPoints(width, height);

    let color = this.getActivityColor(element.activity);
    if(this.colorMap) {
      color = this.colorMap.get(element.activity);
    }

    let hoverText = parent.append('text')
                          .classed('svg-text', true)
                          .attr('y', -4)
                          .text(element.activity)
                          .attr('visibility', 'hidden');

    parent.append('polygon')
          .attr('points', polygonPoints)
          .style('fill', color)
          .style('stroke', 'black')
          .on('mouseover', () => {
            hoverText.attr('visibility', 'visible')
          })
          .on('mouseout', () => {
            hoverText.attr('visibility', 'hidden')
          });
    
    let text = element.activity;
    if(!element.expanded) {
      text = element.activity.slice(0, 5);
      if(element.activity.length > 5) {
        text += "...";
      }
    }    

    let activityText = parent.append("text")
          .text(element.activity)
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', Constants.FONT_SIZE)

    let l = activityText.node().getComputedTextLength();
    if(element.expanded) {
      activityText.text(text);
    } else {
      activityText.remove();
    }

    element.textLength = l;

    hoverText.raise()
  }


  getColor(element: VariantElement) {
    return '#2b2b2b'
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

  getPolygonPoints(width: number, height: number): string {
    let x = 0, y = 0;
    let headLength = Math.tan(Constants.ARROW_HEAD_ANGLE / 360 * Math.PI * 2) * (height / 2);

    width -= headLength;

    let points = [];
    points.push(`${x},${y}`); // Top left
    points.push(`${x + width},${y}`); // Top right 
    points.push(`${x + width + headLength},${y + height / 2}`); // Arrow Head
    points.push(`${x + width},${y + height}`); // Bottom right
    points.push(`${x},${y + height}`); // Bottom left
    points.push(`${x + headLength},${y + height / 2}`); // Arrow feather
    return points.join(" ");
  }
}
