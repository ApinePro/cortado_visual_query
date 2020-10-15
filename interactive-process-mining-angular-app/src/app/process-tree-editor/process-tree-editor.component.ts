import {Component, OnInit, ViewChild, AfterViewInit, ElementRef, ViewEncapsulation, HostListener} from '@angular/core';
import * as d3 from "d3";
import {tree_node_height_width} from "./constants_tree_d3";
import {root} from "rxjs/internal-compatibility";

@Component({
  selector: 'app-process-tree-editor',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './process-tree-editor.component.html',
  styleUrls: ['./process-tree-editor.component.css']
})
export class ProcessTreeEditorComponent implements OnInit, AfterViewInit {

  constructor() {

  }

  @ViewChild("d3svg") svgElem: ElementRef;
  @ViewChild("d3container") d3ContainerElem: ElementRef;


  ngOnInit(): void {
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.plot(this.root);
  }

  plot = function (root) {
    console.log("plot")
    const svg = d3.select("#d3-svg")


    console.log(this.d3ContainerElem.nativeElement.offsetWidth)
    console.log(this.d3ContainerElem.nativeElement.offsetHeight)


    const treeLayout = d3.tree();
    treeLayout.size([this.d3ContainerElem.nativeElement.offsetWidth, this.d3ContainerElem.nativeElement.offsetHeight - tree_node_height_width]);

    treeLayout(root);

    console.log(root.descendants());
    console.log(root.links());

    const nodeGroups = svg.selectAll('node')
      .data(root.descendants())
      .enter()
      .append("g")

    nodeGroups.append('rect')
      .classed('node-operator', function (d) {
        return d.data.operator !== null
      })
      .classed('node-visible-activity', function (d) {
        return d.data.label !== null
      })
      .attr('x', function (d) {
        return d.x - tree_node_height_width / 2;
      })
      .attr('y', function (d) {
        return d.y;
      })
      .attr('width', tree_node_height_width)
      .attr('height', tree_node_height_width)
      .attr('stroke', 'gray')
      .attr('stroke-width', '2')

    nodeGroups.append("text")
      .attr("fill", "white")
      .attr("font-size", "1em")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr('x', function (d) {
        return d.x;
      })
      .attr('y', function (d) {
        return d.y + tree_node_height_width / 2 + 3;
      })
      .text(function (d) {
        if (d.data.operator) return d.data.operator;
        if (d.data.label) return d.data.label;
      })

    nodeGroups.selectAll(".node-visible-activity").attr('x', function (d) {
      return d.x - Math.max(tree_node_height_width, this.nextSibling.getComputedTextLength() + 10) / 2;
    }).attr("width", function () {
      return Math.max(tree_node_height_width, this.nextSibling.getComputedTextLength() + 10);
    })


    // add edges
    svg.selectAll('link').data(root.links()).enter()
      .append('line').attr('class', 'link')
      .attr('x1', function (d) {
        return d.source.x
      })
      .attr('y1', function (d) {
        return d.source.y + tree_node_height_width
      })
      .attr('x2', function (d) {
        return d.target.x
      })
      .attr('y2', function (d) {
        return d.target.y
      })
      .attr('stroke', 'gray');
  }

  root = {
    operator: '\u2715',
    label: null,
    children: [
      {
        operator: '\u21BA',
        label: null,
        children: [{
          operator: null,
          label: "a",
          children: []
        },
          {
            operator: null,
            label: "b",
            children: []
          }]
      }, {
        operator: '\u2227',
        label: null,
        children: [
          {
            operator: null,
            label: "a",
            children: []
          },
          {
            operator: null,
            label: "b",
            children: []
          },
          {
            operator: null,
            label: "long activity name c",
            children: []
          }
        ]
      }, {
        operator: '\u2192',
        label: null,
        children: [
          {
            operator: null,
            label: "a",
            children: []
          },
          {
            operator: null,
            label: "b",
            children: []
          },
          {
            operator: null,
            label: "long activity name c",
            children: []
          }
        ]
      }
    ]
  };

  ngAfterViewInit() {
    console.log(d3.hierarchy(this.root));
    this.plot(d3.hierarchy(this.root));
  }


}
