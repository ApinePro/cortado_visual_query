import {Component, OnInit, ViewChild, AfterViewInit, ElementRef, ViewEncapsulation, HostListener} from '@angular/core';
import * as d3 from "d3";
import {tree_node_height_width} from "./constants_tree_d3";

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
    console.log("window:resize");
    this.plot(d3.hierarchy(this.root, (d) => {
      return d.children;
    }));
  }

  plot = function (root) {
    console.log("plot")
    const svg = d3.select("#d3-svg")
    svg.selectAll("*").remove();

    console.log(this.d3ContainerElem.nativeElement.offsetWidth)
    console.log(this.d3ContainerElem.nativeElement.offsetHeight)

    const treeLayout = d3.tree();
    // If you want nodeSize to work, you can't have a fixed tree size. It will set the size to null.
    treeLayout.size([this.d3ContainerElem.nativeElement.offsetWidth,
      this.d3ContainerElem.nativeElement.offsetHeight - tree_node_height_width]);
    //if nodeSize is used, the root node is drawn at (0,0)
    //treeLayout.nodeSize([100,50])

    treeLayout(root);

    const nodeGroups = svg.selectAll('node')
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("id", function (d) {
        return d.name
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

    nodeGroups.append('rect')
      .classed('node', true)
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

    //add node text
    nodeGroups.append("text")
      .classed('user-select-none', true)
      .attr("fill", "white")
      .attr("font-size", (d) => {
        if (d.data.operator) return "1.5em";
        return "smaller"
      })
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

    // resize leaf nodes if text is too long
    nodeGroups.selectAll(".node-visible-activity").attr('x', function (d) {
      return d.x - Math.max(tree_node_height_width, this.nextSibling.getComputedTextLength() + 10) / 2;
    }).attr("width", function () {
      return Math.max(tree_node_height_width, this.nextSibling.getComputedTextLength() + 10);
    })


    nodeGroups.on("click",
      function (event, index) {


        console.log(this)
        console.log(event);
        console.log(index);
        selectSubtree(this);

      });

    function selectSubtree(node) {
      const selected = 'red';
      const nonSelected = 'gray';
      d3.select(node).select(".node").attr('stroke', () => {
        if (d3.select(node).select(".node").attr('stroke') == selected) {
          return nonSelected;
        } else {
          return selected;
        }
      })
      console.log(node.children);
      if (node.children) {
        node.children.forEach((d) => {
          this.selectSubtree(d)
        })
      }
    }
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
            label: "long activity name c long activity name c",
            children: []
          }
        ]
      }
    ]
  };

  ngAfterViewInit() {

    console.log(d3.hierarchy(this.root));

    this.plot(d3.hierarchy(this.root, (d) => {
      return d.children;
    }));
  }

}
