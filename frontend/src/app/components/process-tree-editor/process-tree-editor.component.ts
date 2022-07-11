import { PT_Constant } from './../../constants/process_tree_drawer_constants';

import { GoldenLayoutHostComponent } from 'src/app/components/golden-layout-host/golden-layout-host.component';
import { GoldenLayoutComponentService } from 'src/app/services/goldenLayoutService/golden-layout-component.service';
import { BpmnEditorComponent } from './../bpmn-editor/bpmn-editor.component';
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
import { SharedDataService } from '../../services/sharedDataService/shared-data.service';
import { ColorMapService } from '../../services/colorMapService/color-map.service';

import { ImageExportService } from '../../services/imageExportService/image-export-service';

declare var $;
import { PerformanceService } from 'src/app/services/performance.service';
import { ModelPerformanceColorScaleService } from 'src/app/services/performance-color-scale.service';

import {
  ProcessTree,
  ProcessTreeSyntaxInfo,
  checkSyntax,
} from '../../objects/ProcessTree/ProcessTree';

import { DropzoneConfig } from '../drop-zone/drop-zone.component';
import { ActivateTooltipsService } from '../../services/activateTooltipsService/activate-tooltips.service';
import {
  NodeSeletionStrategy,
  ProcessTreeService,
} from 'src/app/services/processTreeService/process-tree.service';

import { LogService } from 'src/app/services/logService/log.service';
import { LayoutChangeDirective } from 'src/app/directives/layout-change/layout-change.directive';
import { ProcessTreeDrawerDirective } from 'src/app/directives/process-tree-drawer/process-tree-drawer.directive';

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
  selectedPerformanceIndicator: string;
  selectedStatistic: string;
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

  @ViewChild(ProcessTreeDrawerDirective)
  processTreeDrawer: ProcessTreeDrawerDirective;

  currentlyDisplayedTreeInEditor;

  // used in dropdown search form
  searchText: string;

  processTreeSyntaxInfo: ProcessTreeSyntaxInfo = undefined;

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

  nodeWidthCache = new Map<string, number>();

  // Inserting node functionality
  selectedMethod: Function = this.insertNewNodeBelow;
  lastSelectedInsertMethod: Function = this.insertNewNodeBelow;

  activityColorMap: Map<string, string>;
  performanceColorMap : Map<number, any>;

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
    });

    this.performanceColorScaleService.currentColorScale.subscribe(
      (colorMap) => {
        if (colorMap && colorMap != this.performanceColorMap) {
          this.performanceColorMap = colorMap;
        }
      }
    );

    this.processTreeService.currentDisplayedProcessTree$.subscribe((res) => {
      // If the tree was loaded via the process tree import or Drag&Drop that does not contain the current activites

      if (res) {

        this.currentlyDisplayedTreeInEditor = res
        console.warn('update tree triggered by service');

        console.log(res)


        this.selectRootNodeFromID(this.selectedRootNodeId);


      } else if (res === null && this.mainSvgGroup) {
        
        this.selectedRootNode = null;
        this.root = null;
      }
    });

  }

  redraw(tree){

    // add node groups that contain a rectangle and text
    this.selectedStatistic = this.performanceColorScaleService.selectedColorScale.statistic;
    this.selectedPerformanceIndicator = this.performanceColorScaleService.selectedColorScale.performanceIndicator;
    this.performanceColorMap = this.performanceColorScaleService.getColorScale();

    this.processTreeSyntaxInfo = checkSyntax(tree);
    this.processTreeService.correctTreeSyntax = this.processTreeSyntaxInfo.correctSyntax;

    this.currentlyDisplayedTreeInEditor = tree 
    

  }

  ngAfterViewInit(): void {
    this._goldenLayoutHostComponent =
      this.goldenLayoutComponentService.goldenLayoutHostComponent;
    this._goldenLayout = this.goldenLayoutComponentService.goldenLayout;

    this.initializeSvg();

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
      this.processTreeDrawer.getProcessTreeObject()
    );
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
    this.processTreeService.shiftSubtreeToLeft(this.selectedRootNode.data)
  }

  // @REFRACTOR INTO PROCESSTREE SERVICE
  shiftSubtreeToRight(): void {
    this.processTreeService.shiftSubtreeToRight(this.selectedRootNode.data)
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

  // @REFRACTOR INTO PROCESSTREE SERVICE
  deleteSubtree(): void {
    this.processTreeService.deleteSelected(this.selectedRootNode.data); 
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
    this.afterInsertNode();
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
      this.afterInsertNode();
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
    this.afterInsertNode();
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
    this.afterInsertNode();
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
    this.afterInsertNode();
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
    this.afterInsertNode();
  }

  afterInsertNode(): void {
    this.selectedRootNodeOnly = true;
    this.processTreeService.selectedRootNodeID = this.selectedRootNode.data.id;

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


  // Refactor to Directive with Variant Editor / BPMN Viewer
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

  selectNodeCallBack = (self, event, d) => {
    this.pushIDtoService(self, d),
    this.performanceService.treeSelection.next(ProcessTree.fromObj(d.data));
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

  freezeSubtree(): void {
    this.processTreeService.freezeSubtree(this.selectedRootNode.data);
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
    this.mainSvgGroup = this.svg.select('#zoomGroup')

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
    const xOffset = Math.abs(xLower) + PT_Constant.export_offset;

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
      .attr('transform', `translate(0, ${PT_Constant.export_offset})`);

    // Export the tree
    this.imageExportService.export(
      'process_tree',
      svgBBox.width + 2 * PT_Constant.export_offset,
      svgBBox.height + PT_Constant.export_offset,
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
