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
  variant: [string, string][][];

  @Output() 
  selectVariant = new EventEmitter<[string, string][][]>();

  svg: Selection<any, any, any, any>;

  constructor() { }

  ngAfterViewInit(): void {
    this.draw();
  }

  private expanded = false;

  draw() {
    this.fixVariant();

    let leafWidth = this.expanded ? Constants.LEAF_WIDTH_EXPANDED : Constants.LEAF_WIDTH;

    this.svg = d3.select(this.svgElement.nativeElement);

    let nodes = new Map<string, ActivityInstance[]>();
    this.variant.forEach(v => v.forEach(e => nodes.set(e[0], [])));

    let xIndex = 0;
    let yIndices: boolean[] = [];

    for(let grp of this.variant) {
      grp.sort((a, b) => {
        if(a[1] === b[1]) {
          return 0;
        } else if(a[1] == "start") {
          return 1;
        }

        return -1;
      });
      let xInc = 0;

      if(grp.filter(([a, l]) => l == 'complete').length > 0) {
        xIndex += 0.5;
      }
      for(let [activity, lifecycle] of grp) {
        if(lifecycle == "start") {
          let x = leafWidth * xIndex;

          let yIndex = 0;
          while(yIndices[yIndex]) {
            yIndex++;
          }
          yIndices[yIndex] = true;

          let y = (Constants.LEAF_HEIGHT + Constants.MARGIN_Y) * yIndex;
          let g = this.svg.append('g')
                .attr('transform', `translate(${x}, ${y})`);
          let node = new ActivityInstance(new LeafNode(activity), g, xIndex, yIndex);
          nodes.get(activity).push(node);
          
          xInc = 0.5;
        } else {
          let node = nodes.get(activity).shift();
          let width = Math.max((xIndex - node.x) * leafWidth, leafWidth);
          node.node.width = width;
          VariantFragmentComponent.drawLeafNode(node.node, node.parent, this.colorMap);
          yIndices[node.y] = false;
        }
      }
      xIndex += xInc;
    }

    this.svg.attr("height", yIndices.length * (Constants.LEAF_HEIGHT + Constants.MARGIN_Y));
    this.svg.attr("width", xIndex * leafWidth);
  }

  fixVariant() {
    let prepend = [];
    let starts = new Map<string, number>();
    for(let i = 0; i < this.variant.length; i++) {
      for(let [activity, lifecycle] of this.variant[i]) {
        if(lifecycle == 'start') {
          starts.set(activity, starts.get(activity) || 0 + 1);
        } else {
          if((starts.get(activity) || 0) == 0) {
            if(i == 0) {
              prepend.push([activity, "start"]);
            } else {
              this.variant[i - 1].push([activity, "start"]);
            }
          }
        }
      }
    }
    if(prepend.length > 0) {
      this.variant.unshift([]);
      prepend.forEach(x => this.variant[0].push(x));
    }
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