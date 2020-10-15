import {Component, OnInit, ViewChild, AfterViewInit, ElementRef, ViewEncapsulation} from '@angular/core';
import * as d3 from "d3";
import {tree_operator_height_width} from "./constants_tree_d3";

@Component({
  selector: 'app-process-tree-editor',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './process-tree-editor.component.html',
  styleUrls: ['./process-tree-editor.component.css']
})
export class ProcessTreeEditorComponent implements OnInit, AfterViewInit {

  constructor() {

  }

  @ViewChild("d3Container") divView: ElementRef;

  ngOnInit(): void {

  }

  width = 100;
  height = 100;

  plot = function (root) {
    console.log("plot")
    const svg = d3.select("#d3Container").append("svg").attr('width', "100%").attr('height', "100%");


    var treeLayout = d3.tree();
    treeLayout.size([300, 100]);
    treeLayout(root);

    console.log(root.descendants());
    console.log(root.links());

    svg.selectAll('node')
      .data(root.descendants())
      .enter()
      .append('rect')
      .classed('node-operator', function (d) {
        return d.data.operator !== null
      })
      .classed('node-visible-activity', function (d) {
        return d.data.label !== null
      })
      .attr('x', function (d) {
        return d.x;
      })
      .attr('y', function (d) {
        return d.y;
      })
      .attr('width', tree_operator_height_width)
      .attr('height', tree_operator_height_width)
      .attr('stroke', 'gray')
      .attr('stroke-width', '2')
    //.attr('fill', 'none')

    //add node text
    svg.selectAll('node')
      .data(root.descendants())
      .enter()
      .append("text")
      .attr("fill", "blue")
      .attr("font-size", "1em")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr('x', function (d) {
        return d.x + tree_operator_height_width / 2;
      })
      .attr('y', function (d) {
        return d.y + tree_operator_height_width / 2 +3;
      })
      .text(function (d) {
        if (d.data.operator) return d.data.operator;
        if (d.data.label) return d.data.label;
      })

    // add edges
    svg.selectAll('link').data(root.links()).enter()
      .append('line').attr('class', 'link')
      .attr('x1', function (d) {
        return d.source.x + tree_operator_height_width / 2
      })
      .attr('y1', function (d) {
        return d.source.y + tree_operator_height_width
      })
      .attr('x2', function (d) {
        return d.target.x + tree_operator_height_width / 2
      })
      .attr('y2', function (d) {
        return d.target.y
      })
      .attr('stroke', 'gray');
  }

  ngAfterViewInit() {
    const root = {
      operator: '\u2715',
      label: null,
      children: [
        {
          operator: '\u21BA',
          label: null,
          children: []
        }, {
          operator: '\u2227',
          label: null,
          children: []
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

    console.log(d3.hierarchy(root));
    this.plot(d3.hierarchy(root));
  }


}
