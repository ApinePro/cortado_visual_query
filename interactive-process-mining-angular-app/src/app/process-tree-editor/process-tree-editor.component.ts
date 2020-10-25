import {Component, OnInit, ViewChild, AfterViewInit, ElementRef, ViewEncapsulation, HostListener} from '@angular/core';
import * as d3 from "d3";
import {tree_node_height_width} from "./constants_tree_d3";
//jQuery
declare var $;

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

  resizeTimer;

  @HostListener('window:resize', ['$event'])
  onResize() {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(function () {
      console.log("replot svg");
      //resizing has potentially "stopped", i.e., user has not resized window since last 250ms
      this.plot(d3.hierarchy(this.root, (d) => {
        return d.children;
      }));
    }.bind(this), 250);
  }

  selectNodeActive: boolean = true;
  selectSubtreeActive: boolean = false;

  selectNode() {
    this.selectNodeActive = true;
    this.selectSubtreeActive = false;
  }

  selectSubtree() {
    this.selectNodeActive = false;
    this.selectSubtreeActive = true;
  }

  selectedTreeNodeStrokeColor = 'red';
  nonSelectedTreeNodeStrokeColor = 'gray';

  plot = function (root) {
    console.log("plot")
    console.log(this.d3ContainerElem.nativeElement.offsetWidth)
    console.log(this.d3ContainerElem.nativeElement.offsetHeight)

    const svg = d3.select("#d3-svg")
    //clear svg before plot (needed when window is resized)
    svg.selectAll("*").remove();

    //add zoom option
    const mainSvgGroup = svg.append("g").attr("id", "zoomGroup")
    mainSvgGroup.attr('transform', 'translate(' + (this.d3ContainerElem.nativeElement.offsetWidth / 2) + ',0)');

    const zooming = function (event) {
      // .translate((this.d3ContainerElem.nativeElement.offsetWidth / 2), 0) is needed to center the tree
      // otherwise center is at (0,0)
      console.log(event)
      mainSvgGroup.attr("transform",
        event.transform.translate((this.d3ContainerElem.nativeElement.offsetWidth / 2), 0));
    }.bind(this);

    const zoom: any = d3.zoom().on("zoom", zooming)
    svg.call(zoom).on("dblclick.zoom", null);

    //reset zoom
    d3.select("#btn-reset-zoom").on("click", () => {
      svg.transition()
        .duration(250)
        .call(zoom.transform, d3.zoomIdentity);
    });


    const treeLayout = d3.tree();
    treeLayout.size([this.d3ContainerElem.nativeElement.offsetWidth,
      this.d3ContainerElem.nativeElement.offsetHeight - tree_node_height_width]);
    //if nodeSize is used you cannot use fixed tree size and the root node is drawn at (0,0)
    treeLayout.nodeSize([140, 60])

    // calculate layout
    treeLayout(root);

    //add node groups that contain a rectangle and text
    const nodeGroups = mainSvgGroup.selectAll('node')
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("id", function (d) {
        // @ts-ignore
        return d.data.id
      })
      .attr("data-toggle", "tooltip")
      .attr("data-placement", "top")
      .attr("title", (d: any) => {
        return d.data.label
      })

    // add edges
    mainSvgGroup.selectAll('link').data(root.links()).enter()
      .append('line').attr('class', 'link')
      .attr('x1', function (d: any) {
        return d.source.x
      })
      .attr('y1', function (d: any) {
        return d.source.y + tree_node_height_width
      })
      .attr('x2', function (d: any) {
        return d.target.x
      })
      .attr('y2', function (d: any) {
        return d.target.y
      })
      .attr('stroke', 'gray');

    //add nodes
    nodeGroups.append('rect')
      .classed('node', true)
      .classed('node-operator', function (d: any) {
        return d.data.operator !== null
      })
      .classed('node-visible-activity', function (d: any) {
        return d.data.label !== null && d.data.label !== "\u03C4"
      })
      .classed('node-invisible-activity', (d: any) => {
        return d.data.label === "\u03C4"
      })
      .attr('x', function (d: any) {
        return d.x - tree_node_height_width / 2;
      })
      .attr('y', function (d: any) {
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
      .attr("font-size", (d: any) => {
        if (d.data.operator) return "1.5em";
        return "smaller";
      })
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr('x', function (d: any) {
        return d.x;
      })
      .attr('y', function (d: any) {
        return d.y + tree_node_height_width / 2 + 3;
      })
      .text(function (d: any) {
        if (d.data.operator) return d.data.operator;
        if (d.data.label) {
          //shorten text if it is too long
          if (d.data.label.length <= 20) {
            return d.data.label;
          } else {
            return d.data.label.substring(0, 20) + "...";
          }
        }
      })

    // resize leaf nodes if text is too long
    nodeGroups.selectAll(".node-visible-activity").attr('x', function (d) {
      // @ts-ignore
      return d.x - Math.max(tree_node_height_width, this.nextSibling.getComputedTextLength() + 10) / 2;
    }).attr("width", function () {
      // @ts-ignore
      return Math.max(tree_node_height_width, this.nextSibling.getComputedTextLength() + 10);
    })


    nodeGroups.on("click",
      function (event, index, a) {
        console.log(this)
        console.log(event);
        console.log(index);
        unselectAllNodes()
        selectSubtree(this, index);
      });

    const selectSubtree = function (svgGroup, index) {
      d3.select(svgGroup).select(".node").attr('stroke', () => {
        if (d3.select(svgGroup).select(".node").attr('stroke') == this.selectedTreeNodeStrokeColor) {
          return this.nonSelectedTreeNodeStrokeColor;
        } else {
          return this.selectedTreeNodeStrokeColor;
        }
      })
      if (index.children && this.selectSubtreeActive) {
        index.children.forEach(c => {
            console.log(c)
            console.log(mainSvgGroup.select('[id="' + c.data.id + '"]').node())
            selectSubtree(mainSvgGroup.select('[id="' + c.data.id + '"]').node(), c);
          }
        )
      }
    }.bind(this)

    const unselectAllNodes = function () {
      console.log(nodeGroups.selectAll('rect'))
      nodeGroups.selectAll('rect').attr('stroke', this.nonSelectedTreeNodeStrokeColor)
    }.bind(this)
  }

  root = {
    operator: '\u2715',
    label: null,
    id: 7823782323,
    children: [
      {
        operator: '\u21BA',
        label: null,
        id: 7823342323,
        children: [{
          operator: null,
          label: "\u03C4",
          id: 7822782323,
          children: []
        },
          {
            operator: null,
            label: "b",
            id: 7823782399,
            children: []
          }]
      }, {
        operator: '\u2227',
        label: null,
        id: 1123782323,
        children: [
          {
            operator: null,
            label: "a",
            id: 7823782823,
            children: []
          },
          {
            operator: null,
            label: "b",
            id: 7823782023,
            children: []
          },
          {
            operator: null,
            label: "long activity name c",
            id: 7824782323,
            children: []
          }
        ]
      }, {
        operator: '\u2192',
        label: null,
        id: 7829482323,
        children: [
          {
            operator: null,
            label: "very long activity name c long activity name c",
            id: 7824982323,
            children: []
          },
          {
            operator: null,
            label: "very long activity name c long activity name cb",
            id: 7854782323,
            children: []
          },
          {
            operator: null,
            label: "very long activity name c long activity name c",
            id: 7899782323,
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

    //activate tooltips
    $(function () {
      $('[data-toggle="tooltip"]').tooltip({
        container: "body",
        placement: "top",
        delay: {show: 240, hide: 60}
      })
    })
  }
}
