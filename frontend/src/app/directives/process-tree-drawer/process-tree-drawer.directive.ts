import { PT_Constant } from './../../constants/process_tree_drawer_constants';
import { ProcessTreeService } from 'src/app/services/processTreeService/process-tree.service';
import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { getPerformanceTable } from 'src/app/components/process-tree-editor/utils';
import { textColorForBackgroundColor } from 'src/app/utils/helper_functions';
import { ProcessTree, ProcessTreeOperator } from 'src/app/objects/ProcessTree/ProcessTree';
import { flextree } from 'd3-flextree';

import * as d3 from 'd3';

@Directive({
  selector: '[appProcessTreeDrawer]'
})
export class ProcessTreeDrawerDirective implements OnChanges{


  nodeEnter: any;

  root: d3.HierarchyNode<any>;
  mainSvgGroup: any;

  processTreeSyntaxInfo: any;
  selectedRootNode: any;

  constructor(
    elRef: ElementRef,
    private processTreeService : ProcessTreeService,
  ) {
    this.mainSvgGroup = d3.select(elRef.nativeElement);
  }


  @Input()
  activityColorMap : Map<string, string>

  @Input()
  performanceColorMap : Map<number, any>

  @Input()
  selectedStatistic

  @Input()
  selectedPerformanceIndicator

  @Input()
  onClickCallBack

  @Input()
  currentlyDisplayedTree

  ngOnChanges(changes: SimpleChanges): void {

    console.log(changes)

    if (changes?.currentlyDisplayedTree?.currentValue){
      this.root = d3.hierarchy(this.currentlyDisplayedTree, (d) => {
        // @ts-ignore
        return d.children;
      });
    } else {
      this.root = null;
    }

    console.log(this.root);

    console.log('NodeWidthCache', this.processTreeService.nodeWidthCache);
    this.update(this.root);
  }

  drawNodes(
    node: d3.Selection<any, any, any, any>,
    activityColorMap: Map<string, string>,
    selectedPerformanceIndicator,
    selectedStatistic
  ) {
    // add node groups
    this.nodeEnter = node
      .enter()
      .append('g')
      .attr('id', function (d) {
        return d.data.id;
      })
      .attr('data-bs-toggle', 'tooltip')
      .attr('data-bs-placement', 'top')
      .attr('data-bs-title', (d) => {
        if (
          this.hasPerformance(d) &&
          d.data.label !== ProcessTreeOperator.tau
        ) {
          return (
            `<div style="display: flex; justify-content: space-between" class="performance-tooltip-header-style bg-dark">
        <h6 style="flex: 1" class="performance-tooltip-header">` +
            (d.data.label || d.data.operator) +
            `</h6>
      </div>` +
            getPerformanceTable(
              d.data.performance,
              selectedPerformanceIndicator,
              selectedStatistic
            )
          );
        }

        return d.data.label || d.data.operator;
      })
      .attr('data-bs-template', (d) => {
        if (
          this.hasPerformance(d) &&
          d.data.label !== ProcessTreeOperator.tau
        ) {
          return `<div class="tooltip performance-tooltip" role="tooltip">
                <div class="tooltip-arrow"></div>
                <div class="tooltip-inner p-0" style="max-width: none;"></div>
              </div>`;
        }

        return `<div class="tooltip" role="tooltip">
              <div class="tooltip-arrow"></div>
              <div class="tooltip-inner"></div>
            </div>`;
      })
      .attr('data-bs-html', true);

    // add nodes
    this.nodeEnter
      .append('rect')
      .classed('node', true)
      .attr('rx', PT_Constant.tree_corner_radius)
      .attr('ry', PT_Constant.tree_corner_radius)
      .attr('stroke', PT_Constant.tree_stroke_color)
      .attr('stroke-width', PT_Constant.tree_stroke_width)
      .merge(node.select('.node'))
      .style('fill', (d) => {
        if (
          this.root.data.performance &&
          d.data.label !== ProcessTreeOperator.tau
        ) {
          if (
            this.performanceColorMap.has(d.data.id) &&
            d.data.performance?.[selectedPerformanceIndicator]?.[
              selectedStatistic
            ] !== undefined
          ) {
            return this.performanceColorMap.get(d.data.id)(
              d.data.performance[selectedPerformanceIndicator][
                selectedStatistic
              ]
            );
          } else {
            return '#404040';
          }
        } else {
          if (d.data.operator !== null) return PT_Constant.node_operator_color;
          if (d.data.label !== null && d.data.label === ProcessTreeOperator.tau)
            return PT_Constant.node_non_visible_activity_color;
          const isVisibleActivity =
            d.data.label !== null && d.data.label !== ProcessTreeOperator.tau;
          return isVisibleActivity ? activityColorMap.get(d.data.label) : null;
        }
      })
      .classed('node-operator', function (d: any) {
        return d.data.operator !== null;
      })
      .classed('frozen-node-operator', function (d: any) {
        return d.data.operator !== null && d.data.frozen === true;
      })
      .classed('node-visible-activity', function (d: any) {
        return (
          d.data.label !== null && d.data.label !== ProcessTreeOperator.tau
        );
      })
      .classed('selected-node', function (d: any) {
        return d.data.selected;
      })
      .classed('frozen-node-visible-activity', function (d: any) {
        return (
          d.data.label !== null &&
          d.data.label !== ProcessTreeOperator.tau &&
          d.data.frozen === true
        );
      })
      .attr('fill', function (d: any) {
        if (d.data.operator !== null) return PT_Constant.node_operator_color;
        if (d.data.label !== null && d.data.label === ProcessTreeOperator.tau)
          return PT_Constant.node_non_visible_activity_color;
        const isVisibleActivity =
          d.data.label !== null && d.data.label !== ProcessTreeOperator.tau;
        return isVisibleActivity
          ? activityColorMap.get(d.data.label) ||
              PT_Constant.node_visible_activity_color
          : null;
      })
      .classed('node-invisible-activity', (d: any) => {
        return d.data.label === ProcessTreeOperator.tau;
      })
      .classed('frozen-node-invisible-activity', (d: any) => {
        return (
          d.data.label === ProcessTreeOperator.tau && d.data.frozen === true
        );
      })
      .attr('width', PT_Constant.tree_node_height_width)
      .attr('height', PT_Constant.tree_node_height_width)
      .attr('font-size', (d: any) => {
        if (d.data.label === ProcessTreeOperator.tau)
          return PT_Constant.node_invisible_font_size;
        return '';
      })
      .attr('x', function (d: any) {
        return d.x - PT_Constant.tree_node_height_width / 2;
      })
      .attr('y', function (d: any) {
        return d.y;
      });

    // add node text
    this.nodeEnter
      .append('text')
      .classed('user-select-none', true)
      .classed('node-text', true)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .merge(node.select('text'))
      .attr('fill', (d) => {
        if (
          d.data.frozen ||
          d.data.label === ProcessTreeOperator.tau ||
          (d.data.performance == undefined &&
            this.root.data.performance != undefined)
        ) {
          return 'white';
        }

        let nodeColor = activityColorMap.get(d.data.label);

        if (
          d.data.performance &&
          this.performanceColorMap.has(d.data.id) &&
          d.data.performance[selectedPerformanceIndicator]
        ) {
          nodeColor = this.performanceColorMap.get(d.data.id)(
            d.data.performance[selectedPerformanceIndicator][selectedStatistic]
          );
        }

        const isVisibleActivity =
          (d.data.label !== null && d.data.label !== ProcessTreeOperator.tau) ||
          (d.data.performance != undefined && nodeColor !== undefined);
        return isVisibleActivity
          ? textColorForBackgroundColor(nodeColor)
          : 'white';
      })
      .attr('font-size', (d: any) => {
        if (d.data.operator) {
          return PT_Constant.node_operator_font_size;
        }
        return PT_Constant.node_visible_font_size;
      })
      .attr('x', function (d: any) {
        return d.x;
      })
      .attr('y', function (d: any) {
        return d.y + PT_Constant.tree_node_height_width / 2 + 3;
      })
      .text(function (d: any) {
        if (d.data.operator) {
          return d.data.operator;
        }
        if (d.data.label) {
          // shorten text if it is too long
          if (d.data.label.length <= 20) {
            return d.data.label;
          } else {
            return d.data.label.substring(0, 20) + '...';
          }
        }
      });

    // resize leaf nodes if text is too long
    this.nodeEnter
      .merge(node)
      .select('.node-visible-activity')
      .attr('x', function (d) {
        return (
          d.x -
          Math.max(
            PT_Constant.tree_node_height_width,
            this.nextSibling.getComputedTextLength() + 10
          ) /
            2
        );
      })
      .attr('width', function () {
        return Math.max(
          PT_Constant.tree_node_height_width,
          this.nextSibling.getComputedTextLength() + 10
        );
      });

    // remove nodes
    node.exit().transition().duration(50).remove();
  }

  drawEdges(root) {
    const edges = this.mainSvgGroup.selectAll('line').data(root.links());

    edges.classed('selected-edge', false);

    // remove old edges
    edges.exit().remove();

    // add edges
    edges
      .enter()
      .append('line')
      .attr('class', 'link')
      .merge(edges)
      // .transition()
      .attr('x1', function (d: any) {
        return d.source.x;
      })
      .attr('y1', function (d: any) {
        return d.source.y + PT_Constant.tree_node_height_width;
      })
      .attr('x2', function (d: any) {
        return d.target.x;
      })
      .attr('y2', function (d: any) {
        return d.target.y;
      })
      .attr('stroke', PT_Constant.tree_stroke_color)
      .classed('frozen-edge', (d) => {
        return d.source.data.frozen;
      })
      .classed('selected-edge', (e) => {
        return e.source.data.selected;
      });
  }

  update(root): void {
    this.mainSvgGroup.selectAll('g').remove();

    if (root) {

      // add node groups that contain a rectangle and text
      const activityColorMap = this.activityColorMap;

      this.calculateTreeLayout(root);

      const node = this.mainSvgGroup
        .selectAll('g')
        .data(root.descendants(), function (d) {
          return d.data.id;
        });

      // Draw Nodes
      this.drawNodes(
        node,
        activityColorMap,
        this.selectedPerformanceIndicator,
        this.selectedStatistic
      );

      // Draw Edges
      this.drawEdges(root);
      this.addSelectionFunctionality();

    } else{
      this.selectedRootNode = null;
      this.mainSvgGroup.selectAll('*').remove();
    }
  }

  private hasPerformance(d) {
    return (
      d.data.performance?.service_time ||
      d.data.performance?.cycle_time ||
      d.data.performance?.waiting_time ||
      d.data.performance?.idle_time
    );
  }


  createNode(operator, label): d3.HierarchyNode<any> {
    // TODO make sure that IDs are unique!!!
    const nodeData = {
      operator,
      label,
      id: Math.floor(1000000000 + Math.random() * 900000000),
      children: [],
    };
    return d3.hierarchy(nodeData);
  }


  calculateTreeLayout(root): void {
    if (root) {
      const flextreeLayout = flextree();
      flextreeLayout.nodeSize((node) => {
        if (node.data.operator || node.data.label === ProcessTreeOperator.tau) {
          return [
            PT_Constant.tree_node_height_width,
            2 * PT_Constant.tree_node_height_width,
          ];
        }

        return [
          this.processTreeService.nodeWidthCache[node.data.label],
          2 * PT_Constant.tree_node_height_width,
        ];
      });

      // Specifies the spacing between two nodes
      flextreeLayout.spacing((nodeA, nodeB) => {
        return nodeA.parent === nodeB.parent
          ? PT_Constant.nodeSpacing
          : 2 * PT_Constant.nodeSpacing;
      });

      // calculate layout
      flextreeLayout(root);
    }
  }


  addSelectionFunctionality(): void {
    this.nodeEnter.on('click',  
    (e: PointerEvent, data) => {
      e.stopPropagation();
      this.onClickCallBack(this, e, data);
    });
  }

  getProcessTreeObject(){
    this._getProcessTreeObject(this.root)
  }


  private _getProcessTreeObject(d3Node : d3.HierarchyNode<ProcessTree>): ProcessTree {
    if (d3Node && 'data' in d3Node) {
      let currentNodeFrozen = false;
      if (d3Node.data.frozen && d3Node.data.frozen === true) {
        currentNodeFrozen = true;
      }

      const tree = new ProcessTree(
        d3Node.data.label,
        d3Node.data.operator,
        [],
        d3Node.data.id,
        currentNodeFrozen,
        d3Node.data.performance,
        null
      );

      if (d3Node.children) {
        d3Node.children.forEach((c) => {
          tree.children.push(this._getProcessTreeObject(c));
        });

        tree.children.forEach((child) => (child.parent = tree));
      }
      return tree;
    } else {
      return null;
    }
  }


}
