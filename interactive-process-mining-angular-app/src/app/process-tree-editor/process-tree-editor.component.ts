import {Component, OnInit, ViewChild, AfterViewInit, ElementRef, ViewEncapsulation, HostListener} from '@angular/core';
import * as d3 from "d3";
import {tree_node_height_width} from "./constants_tree_d3";
import {root} from "rxjs/internal-compatibility";
import {isArray} from "util";
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
      this.update(this.root);
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

  svg;
  mainSvgGroup;
  nodeEnter;

  selectedRootNode;


  horizontallyCenterTree() {
    this.mainSvgGroup.attr('transform', 'translate(' + (this.d3ContainerElem.nativeElement.offsetWidth / 2) + ',0)');
  }

  update(root) {
    this.calculateTreeLayout(root);

    console.log(root);
    console.log(root.descendants());
    console.log(root.links());

    //add node groups that contain a rectangle and text
    let node = this.mainSvgGroup.selectAll('g').data(root.descendants(), function (d) {
      return d.data.id;
    })
    let nodeUpdate = this.mainSvgGroup.selectAll('g').data(root.descendants(), function (d) {
      return d.data.id;
    })

    //remove nodes
    node.exit().transition().duration(50).remove()

    this.nodeEnter = node.enter().append("g")
      .attr("id", function (d) {
        // @ts-ignore
        return d.data.id
      })
      .attr("data-toggle", "tooltip")
      .attr("data-placement", "top")
      .attr("title", (d: any) => {
        return d.data.label
      })


    //add nodes
    this.nodeEnter.append('rect')
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
      .attr('width', tree_node_height_width)
      .attr('height', tree_node_height_width)
      .attr('stroke', 'gray')
      .attr('stroke-width', '2')
      .merge(node.select('rect'))
      //.transition()
      .attr('x', function (d: any) {
        return d.x - tree_node_height_width / 2;
      })
      .attr('y', function (d: any) {
        return d.y;
      })


    //add node text
    this.nodeEnter.append("text")
      .classed('user-select-none', true)
      .attr("fill", "white")
      .attr("font-size", (d: any) => {
        if (d.data.operator) return "1.5em";
        return "smaller";
      })
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
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
      .merge(node.select('text'))
      .attr('x', function (d: any) {
        return d.x;
      })
      .attr('y', function (d: any) {
        return d.y + tree_node_height_width / 2 + 3;
      })


    // add edges
    let edges = this.mainSvgGroup.selectAll('line')
      .data(root.links())

    edges.enter()
      .append('line').attr('class', 'link')
      .merge(edges)
      //.transition()
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

    // remove old edges
    edges.exit().remove()

    // resize leaf nodes if text is too long
    this.nodeEnter
      .merge(node)
      .select(".node-visible-activity")
      .attr('x', function (d) {
        // @ts-ignore
        console.log(d.x)

        console.log(d.x - Math.max(tree_node_height_width, this.nextSibling.getComputedTextLength() + 10) / 2)
        return d.x - Math.max(tree_node_height_width, this.nextSibling.getComputedTextLength() + 10) / 2;
      }).attr("width", function () {
      // @ts-ignore
      console.log(Math.max(tree_node_height_width, this.nextSibling.getComputedTextLength() + 10));
      return Math.max(tree_node_height_width, this.nextSibling.getComputedTextLength() + 10);
    })

    this.horizontallyCenterTree();
    this.addSelectionFunctionality();
  }

  deleteSubtree() {
    console.log(this.selectedRootNode);
    console.log(this.root)
    //this.deleteNodeFromTree(this.root,this.selectedRootNode.data.id)

    console.log(this.root);
    this.deleteNodeAndChildren(this.root, this.selectedRootNode)
    console.log(this.root)
    this.update(this.root);
  }

  deleteNodeAndChildren(tree, nodeToDelete) {
    if (tree.children) {
      tree.children = tree.children.filter(c => c != nodeToDelete)
      tree.children.forEach(function (c) {
        this.deleteNodeAndChildren(c, nodeToDelete);
      }.bind(this))
    }
  }


  calculateTreeLayout(root) {
    const treeLayout = d3.tree();
    treeLayout.size([this.d3ContainerElem.nativeElement.offsetWidth,
      this.d3ContainerElem.nativeElement.offsetHeight - tree_node_height_width]);
    //if nodeSize is used you cannot use fixed tree size and the root node is drawn at (0,0)
    treeLayout.nodeSize([140, 60])
    // calculate layout
    treeLayout(root);
  }

  addZoomFunctionality() {
    this.mainSvgGroup.attr('transform', 'translate(' + (this.d3ContainerElem.nativeElement.offsetWidth / 2) + ',0)');
    const zooming = function (event) {
      // .translate((this.d3ContainerElem.nativeElement.offsetWidth / 2), 0) is needed to center the tree
      // otherwise center is at (0,0)
      //console.log(event)
      this.mainSvgGroup.attr("transform",
        event.transform.translate((this.d3ContainerElem.nativeElement.offsetWidth / 2), 0));
    }.bind(this);

    const zoom: any = d3.zoom().scaleExtent([0.1, 3]).on("zoom", zooming)
    this.svg.call(zoom).on("dblclick.zoom", null);

    //reset zoom
    d3.select("#btn-reset-zoom").on("click", () => {
      this.svg.transition()
        .duration()
        //.ease(d3.easeLinear)
        .call(zoom.transform, d3.zoomIdentity);
    });
  }

  addSelectionFunctionality() {
    this.nodeEnter.on("click",
      function (event, d) {
        console.log(this)
        console.log(event);
        console.log(d);
        unselectAllNodes()
        selectSubtree(this, d);
      }
    );

    const selectSubtree = function (svgGroup, d) {
      this.selectedRootNode = d;
      d3.select(svgGroup).select(".node").attr('stroke', () => {
        if (d3.select(svgGroup).select(".node").attr('stroke') == this.selectedTreeNodeStrokeColor) {
          return this.nonSelectedTreeNodeStrokeColor;
        } else {
          return this.selectedTreeNodeStrokeColor;
        }
      })
      if (d.children && this.selectSubtreeActive) {
        d.children.forEach(c => {
            console.log(c)
            console.log(this.mainSvgGroup.select('[id="' + c.data.id + '"]').node())
            selectSubtree(this.mainSvgGroup.select('[id="' + c.data.id + '"]').node(), c);
          }
        )
      }
      console.log(this.selectedRootNode);
    }.bind(this)

    const unselectAllNodes = function () {
      //console.log(this.nodeGroups.selectAll('rect'))
      this.nodeEnter.selectAll('rect').attr('stroke', this.nonSelectedTreeNodeStrokeColor)
    }.bind(this)

    this.addZoomFunctionality();
  }

  plot(root) {
    console.log("plot")
    console.log(this.d3ContainerElem.nativeElement.offsetWidth)
    console.log(this.d3ContainerElem.nativeElement.offsetHeight)
    console.log(root)

    this.calculateTreeLayout(root)
    this.svg = d3.select("#d3-svg")
    this.svg.selectAll("*").remove();
    //add svg group for zooming
    this.mainSvgGroup = this.svg.append("g").attr("id", "zoomGroup")
    this.update(root)
  }

  root: d3.HierarchyNode<any>;
  tree = {
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
            label: "very long activity label",
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
          },
          {
            operator: null,
            label: "long activity name c",
            id: 7124782321,
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
          },
          {
            operator: null,
            label: "very long activity name c long activity name c",
            id: 3339782323,
            children: []
          }
        ]
      }
    ]
  };

  ngAfterViewInit() {
    console.log(d3.hierarchy(this.tree));
    this.root = d3.hierarchy(this.tree, (d) => {
      return d.children;
    })
    this.plot(this.root);

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
