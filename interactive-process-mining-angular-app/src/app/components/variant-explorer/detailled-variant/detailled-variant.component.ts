import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { constants } from 'buffer';
import * as d3 from 'd3';
import { Selection } from 'd3';
import { ActivateTooltipsService } from 'src/app/services/activateTooltipsService/activate-tooltips.service';
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
      // let completing = grp.filter(([a, l]) => l == 'complete' && (nodes.get(a) || []).length > 0)

      let completing = [];
      grp.filter(([_, l]) => l == 'complete').forEach(([a, _]) => {
        let nACompleting = completing.filter(ac => ac == a).length;
        if((nodes.get(a) || []).length > nACompleting) {
          completing.push(a);
        }
      });

      if(completing.length > 0) {
        xIndex += 0.5;
      }
      for(let activity of completing) {
        let node = nodes.get(activity).shift();
        let width = (xIndex - node.x) * leafWidth;
        node.node.width = width;
        VariantFragmentComponent.drawLeafNode(node.node, node.parent, this.colorMap);
        yIndices[node.y] = false;
      }

      let starting = grp.filter(([a, l]) => l == 'start')
                        .map(([a, _]) => a);
      
      let atomicCompleting = grp.filter(([a, l]) => l == 'complete' && starting.includes(a))
                                .map(([a, _]) => a);
      
      completing.forEach(a => {
        let idx = atomicCompleting.findIndex(a2 => a2 == a);
        if(idx != -1) {
          atomicCompleting.splice(idx, 1);
        }
      });

      let x = xIndex * leafWidth;
      for(let activity of starting) {
        let yIndex = 0;
        while(yIndices[yIndex]) yIndex++;
        yIndices[yIndex] = true;

        let y = (Constants.LEAF_HEIGHT + Constants.MARGIN_Y) * yIndex;
        let g = this.svg.append('g')
              .attr('transform', `translate(${x}, ${y})`);
        let node = new ActivityInstance(new LeafNode(activity), g, xIndex, yIndex);
        nodes.get(activity).push(node);
      }
      if(starting.length > 0) {
        xIndex += 0.5
      }

      if(atomicCompleting.length > 0) {
        xIndex += 0.5;
      }
      for(let activity of atomicCompleting) {
        let node = nodes.get(activity).shift();
        let width = (xIndex - node.x) * leafWidth;
        node.node.width = width;
        VariantFragmentComponent.drawLeafNode(node.node, node.parent, this.colorMap);
        yIndices[node.y] = false;
      }
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
          starts.set(activity, (starts.get(activity) || 0) + 1);
        } else {
          let nStarts = starts.get(activity) || 0;
          if(nStarts == 0) {
            if(i == 0) {
              prepend.push([activity, "start"]);
            } else {
              this.variant[i - 1].push([activity, "start"]);
            }
          } else {
            starts.set(activity, nStarts - 1);
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