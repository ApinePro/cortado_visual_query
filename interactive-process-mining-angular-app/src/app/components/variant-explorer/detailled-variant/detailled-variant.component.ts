import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { Selection } from 'd3';
import { Constants, LeafNode, VariantElement } from '../model';
import { VariantFragmentComponent } from '../variant-fragment/variant-fragment.component';

@Component({
  selector: 'app-detailled-variant',
  templateUrl: './detailled-variant.component.html',
  styleUrls: ['./detailled-variant.component.css']
})
export class DetailledVariantComponent implements AfterViewInit {

  @ViewChild("svg")
  svgElement: ElementRef;

  @Input()
  colorMap: Map<string, string>;

  @Input()
  variant: [[string, string]][];

  @Output() 
  selectVariant = new EventEmitter<[string, string][]>();

  svg: Selection<any, any, any, any>;

  constructor() { }

  ngAfterViewInit(): void {
    this.draw();
  }

  private expanded = false;

  draw() {
    let x = 0;
    let y = 0;

    this.svg = d3.select(this.svgElement.nativeElement);

    let nodes = new Map<string, ActivityInstance[]>();
    this.variant.forEach(v => v.forEach(e => nodes.set(e[0], [])));

    let height = Constants.LEAF_HEIGHT;

    for(let [activity, lifecycle] of this.variant) {
      if(lifecycle == "start") {
        let [newX, newY, node] = this.createStart(x, y, activity);
        x = newX;
        y = newY;
        nodes.get(activity).push(node);
      } else {
        if(nodes.get(activity).length == 0) {
          let [newX, newY, node] = this.createStart(x, y, activity);
          x = newX;
          y = newY;
          nodes.get(activity).push(node);
          height = Math.max(height, y);
        }
        let start = nodes.get(activity).shift();

        if(this.expanded) {
          x += Constants.LEAF_WIDTH_EXPANDED / 2;
        } else {
          x += Constants.LEAF_WIDTH / 2;
        }
        y = Math.min(start.y, y);

        let width = x - start.x;
        start.node.width = width;
        VariantFragmentComponent.drawLeafNode(start.node, start.parent, this.colorMap);
      }

      height = Math.max(height, y);
    }

    this.svg.attr("height", height - Constants.MARGIN_Y);
    this.svg.attr("width", x);
  }

  createStart(x: number, y: number, activity: string): [number, number, ActivityInstance] {
    let g = this.svg.append('g')
                .attr('transform', `translate(${x}, ${y})`);
    let node = new ActivityInstance(new LeafNode(activity), g, x, y);

    if(this.expanded) {
      x += Constants.LEAF_WIDTH_EXPANDED / 2;
    } else {
      x += Constants.LEAF_WIDTH / 2;
    }
    y += Constants.LEAF_HEIGHT + Constants.MARGIN_Y;

    return [x, y, node];
  }

  onClick() {
    this.selectVariant.emit(this.variant);
  }

  public setSelected(selected: boolean) {
    this.expanded = selected;
    d3.select(this.svgElement.nativeElement).selectAll("*").remove();
    this.draw();
  }
}

class ActivityInstance {
  constructor(public node: LeafNode, 
              public parent: Selection<any, any, any, any>,
              public x: number,
              public y: number) {}
}