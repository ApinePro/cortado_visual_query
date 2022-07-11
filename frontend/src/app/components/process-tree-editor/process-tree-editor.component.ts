import { GoldenLayoutHostComponent } from 'src/app/components/golden-layout-host/golden-layout-host.component';
import { GoldenLayoutComponentService } from 'src/app/services/goldenLayoutService/golden-layout-component.service';
import { BpmnEditorComponent } from './../bpmn-editor/bpmn-editor.component';
import { ProcessTreeOperator } from 'src/app/objects/ProcessTree';
import { BackendService } from './../../services/backendService/backend.service';
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  ElementRef,
  Inject,
  Renderer2,
} from '@angular/core';

import { trigger, style, animate, transition } from '@angular/animations';

import { ComponentContainer, GoldenLayout, LogicalZIndex } from 'golden-layout';
import * as d3 from 'd3';
import * as constants from './constants_tree_d3';
import Swal from 'sweetalert2';
import { SharedDataService } from '../../services/sharedDataService/shared-data.service';
import { LayoutChangeDirective } from '../../directives/layout-change.directive';
import { ColorMapService } from '../../services/colorMapService/color-map.service';
import { ImageExportService } from '../../services/imageExportService/image-export-service';
import { flextree } from 'd3-flextree';

declare var $;
import { PerformanceService } from 'src/app/services/performance.service';
import { ModelPerformanceColorScaleService } from 'src/app/services/performance-color-scale.service';
import { getPerformanceTable } from './utils';

import {
  ProcessTree,
  ProcessTreeSyntaxInfo,
  checkSyntax,
} from '../../objects/ProcessTree';
import { textColorForBackgroundColor } from '../variant-explorer/helper_functions';
import { DropzoneConfig } from '../drop-zone/drop-zone.component';
import { ActivateTooltipsService } from '../../services/activateTooltipsService/activate-tooltips.service';
import {
  NodeSeletionStrategy,
  ProcessTreeService,
} from 'src/app/services/processTreeService/process-tree.service';
import { LogService } from 'src/app/services/logService/log.service';

@Component({
  selector: 'app-process-tree-editor',
  templateUrl: './process-tree-editor.component.html',
  styleUrls: ['./process-tree-editor.component.scss'],
  animations: [
    trigger('collapseText', [
      transition(':enter', [
        style({ opacity: '0', transform: 'translateX(-30px)' }),
        animate(
          '150ms 0ms ease-in',
          style({ opacity: '1', transform: 'translateX(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '150ms 00ms ease-in',
          style({ opacity: '0', transform: 'translateX(-30px)' })
        ),
      ]),
    ]),
  ],
})
export class ProcessTreeEditorComponent
  extends LayoutChangeDirective
  implements OnInit, AfterViewInit
{
  constructor(
    private sharedDataService: SharedDataService,
    private activateTooltipsService: ActivateTooltipsService,
    private colorMapService: ColorMapService,
    private imageExportService: ImageExportService,
    private backendService: BackendService,
    private logService: LogService,
    private goldenLayoutComponentService: GoldenLayoutComponentService,
    private performanceService: PerformanceService,
    private performanceColorScaleService: ModelPerformanceColorScaleService,
    private processTreeService: ProcessTreeService,
    private renderer: Renderer2,
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    elRef: ElementRef
  ) {
    super(elRef.nativeElement, renderer);
  }

  @ViewChild('d3svg') svgElem: ElementRef;
  @ViewChild('d3container') d3ContainerElem: ElementRef;

  currentlyDisplayedTreeInEditor;

  // used in dropdown search form
  searchText: string;

  processTreeSyntaxInfo: ProcessTreeSyntaxInfo = undefined;

  resizeTimer;
  currentEditorHeight;

  svg;
  mainSvgGroup;
  nodeEnter;

  collapse: boolean = false;
  NodeSeletionStrategy = NodeSeletionStrategy;
  nodeSelectionStrategy: NodeSeletionStrategy = NodeSeletionStrategy.TREE;

  selectedRootNodeId: number;
  selectedRootNode: d3.HierarchyNode<any>;

  // indicates if the entire subtree below the selectedRootNode is selected or only the single node
  selectedRootNodeOnly: boolean;

  insertPositionLeftRightDisabled = false;
  insertPositionAboveDisabled = false;
  insertPostitonBelowDisabled = false;

  root: d3.HierarchyNode<any>;
  activitiesOccurringInLog: string[];

  nodeWidthCache = new Map<string, number>();

  // Inserting node functionality
  selectedMethod: Function = this.insertNewNodeBelow;
  lastSelectedInsertMethod: Function = this.insertNewNodeBelow;

  activityColorMap: Map<string, string>;
  performanceColorMap;
  processEditorOutOfFocus: boolean = false;

  dropZoneConfig: DropzoneConfig;
  editorOpen: boolean = false;
  _goldenLayoutHostComponent: GoldenLayoutHostComponent;
  _goldenLayout: GoldenLayout;

  tree_syntax_string: string;
  tree_syntax_result: any;

  treeCacheLength: number = 0;
  treeCacheIndex: number = 0;

  ngOnInit(): void {
    this.dropZoneConfig = new DropzoneConfig(
      '.ptml',
      'false',
      'false',
      '<large> Import <strong>Process Tree</strong> .ptml file</large>'
    );

    this.processTreeService.treeCacheIndex$.subscribe((idx) => {
      this.treeCacheIndex = idx;
    });

    this.processTreeService.treeCacheLength$.subscribe((len) => {
      this.treeCacheLength = len;
    });

    this.processTreeService.selectionMode$.subscribe((strategy) => {
      this.nodeSelectionStrategy = strategy;
    });

    this.colorMapService.colorMap$.subscribe((colorMap) => {
      this.activityColorMap = colorMap;
      if (this.root) {
        this.update(this.root);
      }
    });

    this.performanceColorScaleService.currentColorScale.subscribe(
      (colorMap) => {
        if (colorMap && colorMap != this.performanceColorMap) {
          this.performanceColorMap = colorMap;
          this.update(this.root);
        }
      }
    );

    this.processTreeService.currentDisplayedProcessTree$.subscribe((res) => {
      // If the tree was loaded via the process tree import or Drag&Drop that does not contain the current activites

      if (res) {
        if (this.checkForLoadedTreeIntegrity(res).size > 0) {
          const unknownActivities = Array.from(
            this.checkForLoadedTreeIntegrity(res)
          );
          this.computeLeafNodeWidth(unknownActivities);

          Swal.fire({
            title:
              '<tspan class = "text-warning">Current process tree contains unkown activites</tspan>',
            html:
              '<b>Error Message: </b><br>' +
              '<code> The loaded tree contains activities \
                  that do not appear in the currently loaded log.\
                  </code> <br> <br> Unknown Activites: ' +
              '<tspan class = "text-danger">' +
              unknownActivities.join(', ') +
              '</tspan>',
            icon: 'warning',
            showCloseButton: false,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: 'close',
          });
        }

        this.root = d3.hierarchy(res, (d) => {
          // @ts-ignore
          return d.children;
        });

        console.warn('update tree triggered by service');
        this.update(this.root);
        this.selectRootNodeFromID(this.selectedRootNodeId);
      } else if (res === null && this.mainSvgGroup) {
        this.selectedRootNode = null;
        this.root = null;
        this.update(null);
      }
    });

    this.logService.activitiesInEventLog$.subscribe((activities) => {
      this.activitiesOccurringInLog = Array.from(Object.keys(activities));
    });
  }

  // Checks if a newly loaded tree contains an unknown activity
  // @REFRACTOR INTO PROCESSTREE SERVICE
  checkForLoadedTreeIntegrity(tree): Set<string> {
    let unknownActivities = new Set<string>();
    for (let subtree of tree.children) {
      // If it is a operator, recurse on the children
      if (!subtree.label) {
        unknownActivities = new Set<string>([
          ...unknownActivities,
          ...this.checkForLoadedTreeIntegrity(subtree),
        ]);

        // If it is a leaf with unkown label add it to the set
      } else if (
        !(
          this.activitiesOccurringInLog.indexOf(subtree.label) > -1 ||
          subtree.label === ProcessTreeOperator.tau
        )
      ) {
        unknownActivities.add(subtree.label);

        // Else continue
      }
    }

    return unknownActivities;
  }

  ngAfterViewInit(): void {
    this._goldenLayoutHostComponent =
      this.goldenLayoutComponentService.goldenLayoutHostComponent;
    this._goldenLayout = this.goldenLayoutComponentService.goldenLayout;

    this.initializeSvg();

    // Calculate the initial Node width
    this.computeLeafNodeWidth(this.activitiesOccurringInLog);
    // Update the cached values if the activities change
    this.logService.activitiesInEventLog$.subscribe((activities) => {
      this.computeLeafNodeWidth(Array.from(Object.keys(activities)));
    });

    // do not close the insert new node dropdown menu
    $(document).on('click', '#positionMethodSelection', function (e) {
      e.stopPropagation();
    });

    this._goldenLayoutHostComponent =
      this.goldenLayoutComponentService.goldenLayoutHostComponent;
    this._goldenLayout = this.goldenLayoutComponentService.goldenLayout;

    this.processTreeService.selectedRootNodeID$.subscribe((id) => {
      // Change the Selection
      if (id) {
        this.selectRootNodeFromID(id);

        // Unselect all
      } else {
        this.clearDisplayedSelection();
      }

      this.selectedRootNodeId = id;
    });
  }

  private selectRootNodeFromID(id) {
    const selectedRoot = this.mainSvgGroup.select('[id="' + id + '"]');
    const node = selectedRoot.data()[0];

    if (id && node) {
      this.setSelectedRootNode(node);
      this.selectSubtreeFromRoot(selectedRoot.node(), node);
      this.selectEdges();

      this.insertPositionAboveDisabled = Boolean(
        this.selectedRootNode.parent
      ).valueOf();
      this.insertPostitonBelowDisabled = Boolean(
        this.selectedRootNode.data.operator
      ).valueOf();
    }
  }

  saveTreeInSharedDataService(): void {
    console.warn(this.currentlyDisplayedTreeInEditor);
    this.processTreeService.set_currentDisplayedProcessTree_with_Cache(
      this.currentlyDisplayedTreeInEditor
    );
  }

  getProcessTreeObject(d3Node: d3.HierarchyNode<any>): ProcessTree {
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
          tree.children.push(this.getProcessTreeObject(c));
        });

        tree.children.forEach((child) => (child.parent = tree));
      }
      return tree;
    } else {
      return null;
    }
  }

  handleResponsiveChange(
    left: number,
    top: number,
    width: number,
    height: number
  ): void {
    this.collapse = width < 970;

    this.currentEditorHeight = height;
  }

  handleVisibilityChange(visibile: boolean): void {
    if (this.root && visibile) {
      clearTimeout(this.resizeTimer);

      this.update(this.root);
      this.processTreeService.selectedRootNodeID = this.selectedRootNodeId;
    }
  }

  handleZIndexChange(
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void {}

  insertNewNodeButtonDisabled(): boolean {
    return (
      (!this.singleNodeSelected() || !this.selectedRootNode) &&
      this.root !== null &&
      this.root !== undefined
    );
  }

  selectNodeButton(): void {
    this.processTreeService.selectedRootNodeID = null;
    this.processTreeService.selectionMode = NodeSeletionStrategy.NODE;
  }

  selectSubtreeButton(): void {
    this.processTreeService.selectedRootNodeID = null;
    this.processTreeService.selectionMode = NodeSeletionStrategy.TREE;
  }

  singleNodeSelected(): boolean {
    return this.selectedRootNode && this.selectedRootNodeOnly;
  }

  leafNodeSelected(): boolean {
    return this.selectedRootNode && !this.selectedRootNode.children;
  }

  rootNodeSelected(): boolean {
    return this.selectedRootNode && this.selectedRootNode.depth === 0;
  }

  buttonManipulatingMultipleNodesDisabled(): boolean {
    return (
      !this.selectedRootNode ||
      this.rootNodeSelected() ||
      (this.nodeSelectionStrategy == NodeSeletionStrategy.NODE &&
        !this.leafNodeSelected())
    );
  }

  buttonDeleteSubtreeDisabled(): boolean {
    return (
      !this.selectedRootNode ||
      (this.nodeSelectionStrategy == NodeSeletionStrategy.NODE &&
        !this.leafNodeSelected())
    );
  }

  buttonFreezeSubtreeDisabled(): boolean {
    return !this.selectedRootNode || this.leafNodeSelected();
  }

  // @REFRACTOR INTO PROCESSTREE SERVICE
  shiftSubtreeToLeft(): void {
    if (this.selectedRootNode.parent) {
      const idxInParentChildList =
        this.selectedRootNode.parent.children.indexOf(this.selectedRootNode);
      if (idxInParentChildList > 0) {
        const childToRight =
          this.selectedRootNode.parent.children[idxInParentChildList - 1];
        const childToLeft =
          this.selectedRootNode.parent.children[idxInParentChildList];
        this.selectedRootNode.parent.children[idxInParentChildList] =
          childToRight;
        this.selectedRootNode.parent.children[idxInParentChildList - 1] =
          childToLeft;

        this.currentlyDisplayedTreeInEditor = this.getProcessTreeObject(
          this.root
        );
        this.saveTreeInSharedDataService();
      }
    }
  }

  // @REFRACTOR INTO PROCESSTREE SERVICE
  shiftSubtreeToRight(): void {
    if (this.selectedRootNode.parent) {
      const idxInParentChildList =
        this.selectedRootNode.parent.children.indexOf(this.selectedRootNode);
      if (
        idxInParentChildList <
        this.selectedRootNode.parent.children.length - 1
      ) {
        const childToRight =
          this.selectedRootNode.parent.children[idxInParentChildList];
        const childToLeft =
          this.selectedRootNode.parent.children[idxInParentChildList + 1];
        this.selectedRootNode.parent.children[idxInParentChildList + 1] =
          childToRight;
        this.selectedRootNode.parent.children[idxInParentChildList] =
          childToLeft;

        this.currentlyDisplayedTreeInEditor = this.getProcessTreeObject(
          this.root
        );
        this.saveTreeInSharedDataService();
      }
    }
  }

  undo(): void {
    this.processTreeService.undo();
  }

  redo(): void {
    this.processTreeService.redo();
  }

  horizontallyCenterTree(): void {
    this.mainSvgGroup.attr(
      'transform',
      'translate(' + this.d3ContainerElem.nativeElement.offsetWidth / 2 + ',0)'
    );
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
      .attr('rx', constants.tree_corner_radius)
      .attr('ry', constants.tree_corner_radius)
      .attr('stroke', constants.tree_stroke_color)
      .attr('stroke-width', constants.tree_stroke_width)
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
          if (d.data.operator !== null) return constants.node_operator_color;
          if (d.data.label !== null && d.data.label === ProcessTreeOperator.tau)
            return constants.node_non_visible_activity_color;
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
        if (d.data.operator !== null) return constants.node_operator_color;
        if (d.data.label !== null && d.data.label === ProcessTreeOperator.tau)
          return constants.node_non_visible_activity_color;
        const isVisibleActivity =
          d.data.label !== null && d.data.label !== ProcessTreeOperator.tau;
        return isVisibleActivity
          ? activityColorMap.get(d.data.label) ||
              constants.node_visible_activity_color
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
      .attr('width', constants.tree_node_height_width)
      .attr('height', constants.tree_node_height_width)
      .attr('font-size', (d: any) => {
        if (d.data.label === ProcessTreeOperator.tau)
          return constants.node_invisible_font_size;
        return '';
      })
      .attr('x', function (d: any) {
        return d.x - constants.tree_node_height_width / 2;
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
          return constants.node_operator_font_size;
        }
        return constants.node_visible_font_size;
      })
      .attr('x', function (d: any) {
        return d.x;
      })
      .attr('y', function (d: any) {
        return d.y + constants.tree_node_height_width / 2 + 3;
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
            constants.tree_node_height_width,
            this.nextSibling.getComputedTextLength() + 10
          ) /
            2
        );
      })
      .attr('width', function () {
        return Math.max(
          constants.tree_node_height_width,
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
        return d.source.y + constants.tree_node_height_width;
      })
      .attr('x2', function (d: any) {
        return d.target.x;
      })
      .attr('y2', function (d: any) {
        return d.target.y;
      })
      .attr('stroke', constants.tree_stroke_color)
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
      const selectedStatistic =
        this.performanceColorScaleService.selectedColorScale.statistic;

      const selectedPerformanceIndicator =
        this.performanceColorScaleService.selectedColorScale
          .performanceIndicator;

      this.performanceColorMap =
        this.performanceColorScaleService.getColorScale();

      // add node groups that contain a rectangle and text
      const activityColorMap = this.activityColorMap;

      this.currentlyDisplayedTreeInEditor = this.getProcessTreeObject(root);
      this.processTreeSyntaxInfo = checkSyntax(this.getProcessTreeObject(root));

      this.processTreeService.correctTreeSyntax =
        this.processTreeSyntaxInfo.correctSyntax;

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
        selectedPerformanceIndicator,
        selectedStatistic
      );

      // Draw Edges
      this.drawEdges(root);

      this.addSelectionFunctionality();
      this.activateTooltipsService.initializeChildren(this.svgElem);
    } else {
      this.selectedRootNode = null;
      this.currentlyDisplayedTreeInEditor = null;
      this.processTreeSyntaxInfo = null;
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

  // @REFRACTOR INTO PROCESSTREE SERVICE
  deleteSubtree(): void {
    if (this.root === this.selectedRootNode) {
      this.root = null;
      this.update(null);
      this.saveTreeInSharedDataService();
    } else {
      this.deleteNodeAndChildren(this.root, this.selectedRootNode);
      this.update(this.root);
      this.saveTreeInSharedDataService();
    }
    this.processTreeService.selectedRootNodeID = null;
  }

  // @REFRACTOR INTO PROCESSTREE SERVICE
  deleteNodeAndChildren(tree, nodeToDelete): void {
    if (tree.children) {
      tree.children = tree.children.filter((c) => c !== nodeToDelete);
      if (tree.children.length === 0) {
        delete tree.children;
      }
      if (tree.children) {
        tree.children.forEach((c) => {
          this.deleteNodeAndChildren(c, nodeToDelete);
        });
      }
    }
  }

  // @REFRACTOR INTO PROCESSTREE SERVICE
  changeSelectedNode(operator, label): void {
    // console.log(this.selectedRootNode);
    // console.log(operator, label);
    if (operator) {
      // console.log('change operator');
      this.selectedRootNode.data.operator = operator;
      this.selectedRootNode.data.label = null;
    } else if (label) {
      this.selectedRootNode.data.label = label;
      this.selectedRootNode.data.operator = null;
    }
    this.afterInsertNode(this.selectedRootNode);
  }

  // @REFRACTOR INTO PROCESSTREE SERVICE
  insertNewNode(operator, label): void {
    if (this.root) {
      this.selectedMethod(operator, label);
    } else {
      // empty tree - just add a single node
      const newNode = this.createNode(operator, label);
      newNode.parent = null;
      // @ts-ignore
      newNode.height = 0;
      newNode.children = null;
      this.root = newNode;
      this.afterInsertNode(newNode);
    }
  }

  // @REFRACTOR INTO PROCESSTREE SERVICE
  insertNewNodeLeft(operator, label): void {
    if (
      this.selectedRootNode.parent === null ||
      this.selectedRootNode.parent === undefined
    ) {
      return;
    }

    const newNode = this.createNode(operator, label);
    // @ts-ignore
    newNode.depth = this.selectedRootNode.depth;
    newNode.parent = this.selectedRootNode.parent;
    // @ts-ignore
    newNode.height = this.selectedRootNode.height;
    newNode.children = null;
    // console.log(newNode);

    if (this.selectedRootNode.parent) {
      const idx: number = this.selectedRootNode.parent.children.indexOf(
        this.selectedRootNode
      );
      this.selectedRootNode.parent.children.splice(idx, 0, newNode);
    }
    this.afterInsertNode(newNode);
  }

  // @REFRACTOR INTO PROCESSTREE SERVICE
  insertNewNodeAbove(operator, label): void {
    const newNode = this.createNode(operator, label);
    // @ts-ignore
    newNode.depth = 0;
    newNode.parent = null;
    // @ts-ignore
    newNode.height = this.selectedRootNode.height + 1;
    newNode.children = [this.selectedRootNode];
    // console.log(newNode);
    this.selectedRootNode.parent = newNode;
    this.root = newNode;
    this.updateDepthAttributeOfNode(this.selectedRootNode);
    this.afterInsertNode(newNode);
  }

  // @REFRACTOR INTO PROCESSTREE SERVICE
  insertNewNodeBelow(operator, label): void {
    const newNode = this.createNode(operator, label);
    // @ts-ignore
    newNode.depth = this.selectedRootNode.depth + 1;
    newNode.children = null;
    newNode.parent = this.selectedRootNode;
    // @ts-ignore
    newNode.height = 0;
    // console.log(newNode);

    if (this.selectedRootNode.children) {
      this.selectedRootNode.children.push(newNode);
    } else {
      this.selectedRootNode.children = [newNode];
    }
    this.updateHeightAttributeOfNode(this.selectedRootNode);
    this.afterInsertNode(newNode);
  }

  updateHeightAttributeOfNode(node): void {
    node.height += 1;
    if (node.parent) {
      this.updateHeightAttributeOfNode(node.parent);
    }
  }

  updateDepthAttributeOfNode(node): void {
    node.depth += 1;
    if (node.children) {
      node.children.forEach((n) => {
        this.updateDepthAttributeOfNode(n);
      });
    }
  }

  insertNewNodeRight(operator, label): void {
    if (
      this.selectedRootNode.parent === null ||
      this.selectedRootNode.parent === undefined
    ) {
      return;
    }

    const newNode = this.createNode(operator, label);
    // @ts-ignore
    newNode.depth = this.selectedRootNode.depth;
    newNode.parent = this.selectedRootNode.parent;
    // @ts-ignore
    newNode.height = this.selectedRootNode.height;
    newNode.children = null;

    if (this.selectedRootNode.parent) {
      const idx: number = this.selectedRootNode.parent.children.indexOf(
        this.selectedRootNode
      );
      this.selectedRootNode.parent.children.splice(idx + 1, 0, newNode);
    }
    this.afterInsertNode(newNode);
  }

  afterInsertNode(newNode: any): void {
    this.selectedRootNodeOnly = true;

    this.processTreeService.selectedRootNodeID = this.selectedRootNode.data.id;

    this.currentlyDisplayedTreeInEditor = this.getProcessTreeObject(this.root);
    this.saveTreeInSharedDataService();

    this.searchText = undefined;
  }

  // @REFRACTOR INTO PROCESSTREE SERVICE
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

  // END - Inserting node functionality

  calculateTreeLayout(root): void {
    if (root) {
      const flextreeLayout = flextree();
      flextreeLayout.nodeSize((node) => {
        if (node.data.operator || node.data.label === ProcessTreeOperator.tau) {
          return [
            constants.tree_node_height_width,
            2 * constants.tree_node_height_width,
          ];
        }

        return [
          this.nodeWidthCache[node.data.label],
          2 * constants.tree_node_height_width,
        ];
      });

      // Specifies the spacing between two nodes
      flextreeLayout.spacing((nodeA, nodeB) => {
        return nodeA.parent === nodeB.parent
          ? constants.nodeSpacing
          : 2 * constants.nodeSpacing;
      });

      // calculate layout
      flextreeLayout(root);
    }
  }

  computeLeafNodeWidth(nodeActivityLabels: string[]): void {
    const dummy_container = d3
      .select('body')
      .append('svg')
      .style('top', '0px')
      .style('left', '0px')
      .style('position', 'absolute');

    const dummy_select = dummy_container
      .append('text')
      .attr('font-size', '12px');

    for (let nodeActivityLabel of nodeActivityLabels) {
      // Compute the width by rendering a dummy node
      dummy_select.text(function (d: any) {
        if (nodeActivityLabel.length <= 20) {
          return nodeActivityLabel;
        } else {
          return nodeActivityLabel.substring(0, 20) + '...';
        }
      });

      // Retrieve the computed width
      let rendered_width = dummy_select.node().getComputedTextLength();

      // Compute the true node width as specified above
      rendered_width = Math.max(
        rendered_width + 10,
        constants.tree_node_height_width
      );

      // Add to Cache
      this.nodeWidthCache[nodeActivityLabel] = rendered_width;
    }

    // Delete the Dummy
    dummy_select.remove();
    dummy_container.remove();

    this.processTreeService.nodeWidthCache = this.nodeWidthCache;
  }

  addZoomFunctionality(): void {
    this.mainSvgGroup.attr(
      'transform',
      'translate(' + this.d3ContainerElem.nativeElement.offsetWidth / 2 + ',0)'
    );
    const zooming = function (event) {
      // .translate((this.d3ContainerElem.nativeElement.offsetWidth / 2), 0) is needed to center the tree
      // otherwise center is at (0,0)
      // console.log(event)
      this.mainSvgGroup.attr(
        'transform',
        event.transform.translate(
          this.d3ContainerElem.nativeElement.offsetWidth / 2,
          0
        )
      );
    }.bind(this);

    const zoom: any = d3.zoom().scaleExtent([0.1, 3]).on('zoom', zooming);
    this.svg.call(zoom).on('dblclick.zoom', null);

    // reset zoom
    d3.select('#btn-reset-zoom').on(
      'click',
      function () {
        this.svg
          .transition()
          .duration(250)
          .ease(d3.easeExpInOut)
          .call(zoom.transform, d3.zoomIdentity);
      }.bind(this)
    );
  }

  addSelectionFunctionality(): void {
    let performanceService = this.performanceService;
    this.nodeEnter.on('click', function (event, d) {
      pushIDtoService(this, d),
        performanceService.treeSelection.next(ProcessTree.fromObj(d.data));
    });

    const pushIDtoService = this.pushIDtoService;
  }

  private pushIDtoService = (svg, d) => {
    // Activate Toogle by pushing Null to service
    if (d.data.id !== this.selectedRootNodeId) {
      this.processTreeService.selectedRootNodeID = d.data.id;
    } else {
      this.processTreeService.selectedRootNodeID = null;
    }
  };

  private setSelectedRootNode = function (d) {
    this.selectedRootNode = d;
    this.selectedRootNodeOnly =
      this.nodeSelectionStrategy == NodeSeletionStrategy.NODE ||
      this.leafNodeSelected();
  };

  private selectSubtreeFromRoot = function (svgGroup, d) {
    // Unselect All Edges and Rect
    this.mainSvgGroup.selectAll('rect').each((d) => {
      d.data.selected = false;
    });

    this.mainSvgGroup.selectAll('rect').classed('selected-node', false);
    this.mainSvgGroup.selectAll('line').classed('selected-edge', false);

    // Select the node, if it isn't selected yet
    d.data.selected = true;

    // Chose depending on selection strategy, to paint all children
    if (this.nodeSelectionStrategy == NodeSeletionStrategy.TREE) {
      this.selectAllChildren(svgGroup, d);
    } else {
      d3.select(svgGroup).select('.node').classed('selected-node', true);
    }
  };

  private selectAllChildren = function (svgGroup, d) {
    d.data.selected = true;
    d3.select(svgGroup).select('.node').classed('selected-node', true);

    if (!d.children) return;

    // add red stroke around sub-nodes if select subtree is selected
    d.children.forEach((c) => {
      this.selectAllChildren(
        this.mainSvgGroup.select('[id="' + c.data.id + '"]').node(),
        c
      );
    });
  };

  private selectEdges = function () {
    if (this.nodeSelectionStrategy == NodeSeletionStrategy.NODE) {
      return;
    }
    this.mainSvgGroup
      .selectAll('line')
      .classed('frozen-edge', (e) => {
        return e.source.data.frozen;
      })
      .classed('selected-edge', (e) => {
        return e.source.data.selected;
      });
  };

  // @REFRACTOR INTO PROCESSTREE SERVICE
  freezeSubtree(): void {
    const markNodeAsFrozen = (node) => {
      node.data.frozen = true;
      if (node.children) {
        node.children.forEach((child) => {
          markNodeAsFrozen(child);
        });
      }
    };
    const markNodeAsNonFrozen = (node) => {
      node.data.frozen = false;
      if (node.parent && node.parent.data.frozen) {
        markNodeAsNonFrozen(node.parent);
        return;
      }
      if (node.children) {
        node.children.forEach((child) => {
          markNodeAsNonFrozen(child);
        });
      }
    };
    if (!this.selectedRootNode.data.frozen) {
      markNodeAsFrozen(this.selectedRootNode);
    } else {
      markNodeAsNonFrozen(this.selectedRootNode);
    }

    this.processTreeService.selectedRootNodeID = null;
    this.update(this.root);
    this.processTreeService.currentDisplayedProcessTree =
      this.currentlyDisplayedTreeInEditor;
  }

  clearSelection(): void {
    this.processTreeService.selectedRootNodeID = null;
  }

  clearDisplayedSelection(): void {
    this.selectedRootNode = null;
    this.performanceService.treeSelection.next(undefined);

    this.mainSvgGroup.selectAll('rect').each((d) => {
      d.data.selected = false;
    });

    this.mainSvgGroup.selectAll('rect').classed('selected-node', false);
    this.mainSvgGroup.selectAll('line').classed('selected-edge', false);
  }

  applyReductionRules(): void {
    this.backendService.applyTreeReductionRules();
  }

  initializeSvg(): void {
    this.svg = d3.select('#d3-svg');
    // add svg group for zooming
    this.mainSvgGroup = this.svg.append('g').attr('id', 'zoomGroup');

    this.horizontallyCenterTree();
    this.addZoomFunctionality();
  }

  toggleBPMNEditor() {
    this.goldenLayoutComponentService.createSplitViewWindow(
      BpmnEditorComponent.componentName
    );
  }

  exportCurrentTree(svg: SVGGraphicsElement): void {
    // Copy the current tree
    const tree_copy = svg.cloneNode(true) as SVGGraphicsElement;
    const svgBBox = (
      d3.select('#zoomGroup').node() as SVGGraphicsElement
    ).getBBox();

    // Strip all the classed information
    const tree = d3.select(tree_copy);
    tree
      .selectAll('rect')
      .classed('.selected-node', false)
      .classed('.frozen-node', false);
    tree
      .selectAll('line')
      .classed('.selected-edge', false)
      .classed('.frozen-edge', false);

    tree
      .selectAll('g')
      .attr('data-bs-toggle', 'none')
      .attr('data-bs-placement', 'none')
      .attr('data-bs-title', 'none')
      .attr('data-bs-html', 'none')
      .attr('data-bs-template', 'none');

    const shiftbyXOffset = (node, offset, attrKey) => {
      return parseFloat(node.getAttribute(attrKey)) + offset;
    };

    // Recenter the tree and reset scaling
    let xCords: number[] = [];
    tree.selectAll('rect').each(function (this: SVGGraphicsElement) {
      xCords.push(parseFloat(this.getAttribute('x')));
    });

    const xLower = Math.min(...xCords);
    const xOffset = Math.abs(xLower) + constants.export_offset;

    tree.selectAll('rect').attr('x', function (this: SVGGraphicsElement) {
      return shiftbyXOffset(this, xOffset, 'x');
    });
    tree.selectAll('text').attr('x', function (this: SVGGraphicsElement) {
      return shiftbyXOffset(this, xOffset, 'x');
    });
    tree
      .selectAll('line')
      .attr('x1', function (this: SVGGraphicsElement) {
        return shiftbyXOffset(this, xOffset, 'x1');
      })
      .attr('x2', function (this: SVGGraphicsElement) {
        return shiftbyXOffset(this, xOffset, 'x2');
      });

    tree
      .selectChild()
      .attr('transform', `translate(0, ${constants.export_offset})`);

    // Export the tree
    this.imageExportService.export(
      'process_tree',
      svgBBox.width + 2 * constants.export_offset,
      svgBBox.height + constants.export_offset,
      tree_copy
    );
  }

  toggleBlur(event) {
    this.processEditorOutOfFocus = event;
  }
}

// TODO should be solved differently
// tslint:disable-next-line:no-namespace
export namespace ProcessTreeEditorComponent {
  export const componentName = 'ProcessTreeEditorComponent';
}
