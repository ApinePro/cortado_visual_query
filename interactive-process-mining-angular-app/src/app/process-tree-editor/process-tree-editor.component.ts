import {Component, OnInit, ViewChild, AfterViewInit, ElementRef} from '@angular/core';
import * as d3 from "d3";
import {tree_operator_height_width} from "./constants_tree_d3";

@Component({
  selector: 'app-process-tree-editor',
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
    const svg = d3.select("#d3Container").append("svg").attr('width', 500).attr('height', 200);


    var treeLayout = d3.tree();
    treeLayout.size([300, 100]);
    treeLayout(root);

    console.log(root.descendants());
    console.log(root.links());

    svg.selectAll('node')
      .data(root.descendants())
      .enter()
      .append('rect')
      .classed('node', true)
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
      .attr('fill', 'none')

    svg.selectAll('node')
      .data(root.descendants())
      .enter()
      .append("text")
      .attr("fill", "blue")
      .attr("font-size","3em")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline","middle")
      .attr('x', function (d) {
        return d.x + tree_operator_height_width / 2;
      })
      .attr('y', function (d) {
        return d.y + tree_operator_height_width / 2;
      })
      .text(function (d) {
        return d.data.operator;
      })

    // add tree operator text
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
          children: []
        }
      ]
    };

    console.log(d3.hierarchy(root));
    this.plot(d3.hierarchy(root));
  }


}
