
import {
  NodeSeletionStrategy,
  ProcessTreeService,
} from './../../services/processTreeService/process-tree.service';
import { Subscription } from 'rxjs';
import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import * as d3 from 'd3';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';
import { LayoutChangeDirective } from 'src/app/directives/layout-change.directive';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import {
  BPMN_Constant,
  convertPTtoBlockstructuredBPMN,
} from './block-structured-bpmn';

import {
  Block_Structured_BPMN,
  LoopBlock,
  ChoiceBlock,
  SequenceBlock,
  ParallelBlock,
  Event,
} from './block-structured-bpmn';
import { ProcessTree, ProcessTreeOperator } from 'src/app/objects/ProcessTree';
import { textColorForBackgroundColor } from '../variant-explorer/helper_functions';
import { ModelPerformanceColorScaleService } from 'src/app/services/performance-color-scale.service';
import { getPerformanceTable } from '../process-tree-editor/utils';
import { ActivateTooltipsService } from 'src/app/services/activateTooltipsService/activate-tooltips.service';
import { ImageExportService } from 'src/app/services/imageExportService/image-export-service';
import { PerformanceService } from 'src/app/services/performance.service';

@Component({
  selector: 'app-bpmn-editor',
  templateUrl: './bpmn-editor.component.html',
  styleUrls: ['./bpmn-editor.component.css'],
})
export class BpmnEditorComponent
  extends LayoutChangeDirective
  implements OnInit, AfterViewInit, OnDestroy
{
  selectedNode: any;
  currentTree: ProcessTree;

  activityColorMap: Map<string, string>;
  performanceColorMap: Map<number, any>;

  nodeWidthCache = new Map<string, number>();
  selectedRootID: number;

  @ViewChild('bpmn') svgElem: ElementRef;
  @ViewChild('BPMNcontainer') bpmnContainerElem: ElementRef;
  mainGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  selectedStatistic: string;
  selectedPerformanceIndicator: string;
  zoom: d3.ZoomBehavior<Element, unknown>;

  NodeSeletionStrategy = NodeSeletionStrategy;
  nodeSelectionStrategy: NodeSeletionStrategy = NodeSeletionStrategy.TREE;
  treeCacheLength: number = 0;
  treeCacheIndex: number = 0;

  rootNodeIdSub: Subscription;
  curPTSub: Subscription;
  performanceSub: Subscription;
  colorMapSub: Subscription;

  constructor(
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    elRef: ElementRef,
    private renderer: Renderer2,
    private sharedDataService: SharedDataService,
    private colorMapService: ColorMapService,
    private performanceColorScaleService: ModelPerformanceColorScaleService,
    private performanceService: PerformanceService,
    private processTreeService: ProcessTreeService,
    private activateTooltipsService: ActivateTooltipsService,
    private imageExportService: ImageExportService
  ) {
    super(elRef.nativeElement, renderer);
    const state = this.container.initialState;
  }

  ngOnInit(): void {
    this.processTreeService.nodeWidthCache$.subscribe((cache) => {
      this.nodeWidthCache = cache;
    });

    this.processTreeService.treeCacheIndex$.subscribe((idx) => {
      this.treeCacheIndex = idx;
    });

    this.processTreeService.treeCacheLength$.subscribe((len) => {
      this.treeCacheLength = len;
    });

    this.processTreeService.selectionMode$.subscribe((strategy) => {
      this.nodeSelectionStrategy = strategy;
    });
  }

  ngAfterViewInit(): void {
    this.nodeWidthCache = this.processTreeService.nodeWidthCache;

    this.mainGroup = d3
      .select(this.svgElem.nativeElement)
      .append('g')
      .attr('id', 'bpmn-zoom-group');

    this.addZoomFunctionality();
    this.centerContent();
    this.createArrowHeadMarker();

    this.colorMapSub = this.colorMapService.colorMap$.subscribe((colorMap) => {
      this.activityColorMap = colorMap;

      if (this.currentTree) {
        this.redraw();
      }
    });

    this.performanceSub =
      this.performanceColorScaleService.currentColorScale.subscribe(
        (colorMap) => {
          if (colorMap && colorMap != this.performanceColorMap) {
            this.performanceColorMap = colorMap;

            if (this.currentTree) {
              this.redraw();
            }
          }
        }
      );

    this.curPTSub =
      this.processTreeService.currentDisplayedProcessTree$.subscribe((tree) => {
        this.currentTree = tree;
        this.redraw();
      });

    this.rootNodeIdSub = this.processTreeService.selectedRootNodeID$.subscribe(
      (id) => {
        if (id) {
          this.selectBPMNNode(id);
        } else {
          this.unselectAll();
        }

        this.selectedRootID = id;
      }
    );
  }

  ngOnDestroy() {
    this.rootNodeIdSub.unsubscribe();
    this.curPTSub.unsubscribe();
    this.performanceSub.unsubscribe();
    this.colorMapSub.unsubscribe();
  }

  unselectAll() {
    this.mainGroup.classed('selected-bpmn-operator', false);

    this.mainGroup
      .selectAll('.selected-bpmn-event')
      .classed('selected-bpmn-event', false);
    this.mainGroup
      .selectAll('.selected-bpmn-operator')
      .classed('selected-bpmn-operator', false);
  }

  selectBPMNNode(id: number) {
    this.unselectAll();

    const selected_node = this.mainGroup.select('[id="' + id + '"]');
    if (!selected_node.empty()) {
      this.selectedNode = selected_node;
      if ((selected_node.datum() as ProcessTree).operator) {
        if (this.currentTree === selected_node.datum()) {
          this.mainGroup.classed('selected-bpmn-operator', true);
        } else {
          selected_node.classed('selected-bpmn-operator', true);
        }
      } else {
        selected_node.classed('selected-bpmn-event', true);
      }
    }
  }

  selectNode(): void {
    console.log('Set Selection Mode Node');
    this.processTreeService.selectedRootNodeID = null;
    this.processTreeService.selectionMode = NodeSeletionStrategy.NODE;
  }

  selectSubtree(): void {
    console.log('Set Selection Mode Tree');
    this.processTreeService.selectedRootNodeID = null;
    this.processTreeService.selectionMode = NodeSeletionStrategy.TREE;
  }

  undo(): void {
    this.processTreeService.undo();
  }

  redo(): void {
    this.processTreeService.redo();
  }

  handleResponsiveChange(
    left: number,
    top: number,
    width: number,
    height: number
  ): void {}

  handleVisibilityChange(visibile: boolean): void {
    if (this.currentTree && visibile) {
      this.reset_zoom(false);
      this.redraw();
      this.selectBPMNNode(this.selectedRootID);
    }
  }

  handleZIndexChange(
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void {}

  clearSelection() {
    this.processTreeService.selectedRootNodeID = null;
  }

  redraw() {
    this.mainGroup.selectChildren().remove();

    if (this.currentTree) {
      this.selectedStatistic =
        this.performanceColorScaleService.selectedColorScale.statistic;

      this.selectedPerformanceIndicator =
        this.performanceColorScaleService.selectedColorScale.performanceIndicator;

      const model = convertPTtoBlockstructuredBPMN(
        this.currentTree,
        this.nodeWidthCache
      );

      const start = this.mainGroup
        .append('g')
        .attr(
          'transform',
          `translate(${-(
            2 * BPMN_Constant.HORIZONTALSPACING +
            BPMN_Constant.START_END_RADIUS
          )},${BPMN_Constant.bpmn_node_height_width / 2})`
        );

      this.drawStart(start);

      this.drawLine(
        start,
        BPMN_Constant.START_END_RADIUS,
        0,
        BPMN_Constant.START_END_RADIUS + 2 * BPMN_Constant.HORIZONTALSPACING,
        0
      );

      const bpmn = this.mainGroup.append('g');

      this.drawBlock(model, bpmn);

      const end = this.mainGroup
        .append('g')
        .attr(
          'transform',
          `translate(${
            model.width +
            2 * BPMN_Constant.HORIZONTALSPACING +
            BPMN_Constant.START_END_RADIUS
          }, ${BPMN_Constant.bpmn_node_height_width / 2})`
        );

      this.drawEnd(end);

      this.drawLine(
        end,
        -(BPMN_Constant.START_END_RADIUS + 2 * BPMN_Constant.HORIZONTALSPACING),
        0,
        -BPMN_Constant.START_END_RADIUS,
        0
      );

      this.activateTooltipsService.initializeChildren(this.svgElem);
      this.selectBPMNNode(this.selectedRootID);
    }
  }

  drawBlock(model: Block_Structured_BPMN, selection) {
    selection.datum(model._pt);
    selection.attr('id', model._pt.id);

    if (model instanceof SequenceBlock) {
      this.drawSequenceBlock(model, selection);
    } else if (model instanceof Event) {
      this.drawEvent(model, selection);
    } else if (model instanceof ParallelBlock) {
      this.drawParallelBlock(model, selection);
    } else if (model instanceof ChoiceBlock) {
      this.drawChoiceBlock(model, selection);
    } else if (model instanceof LoopBlock) {
      this.drawLoopBlock(model, selection);
    }
  }

  drawParallelBlock(
    model: ParallelBlock,
    selection: d3.Selection<any, any, any, any>
  ) {
    const parallel_block = selection;

    const enter_operator = parallel_block.append('g');
    this.drawOperatorNode(enter_operator, model);

    let offset_x =
      BPMN_Constant.HORIZONTALSPACING + 2 * BPMN_Constant.rectDiagLen;

    let offset_y = 0;

    let interpolate_along_diag;

    if (model.members.length > 1) {
      interpolate_along_diag = [...model.members.keys()].map((i) => {
        return {
          y:
            BPMN_Constant.rectDiagLen -
            (BPMN_Constant.rectDiagLen / (model.members.length - 1)) * i,
          x: (BPMN_Constant.rectDiagLen / (model.members.length - 1)) * i,
        };
      });
    } else {
      interpolate_along_diag = [{ y: 0, x: BPMN_Constant.rectDiagLen }];
    }

    for (let block of model.members) {
      const interpolate = interpolate_along_diag.pop();

      const center = (model.core_width - block.width) / 2;

      // General Case
      if (
        !(block instanceof Event && block.eventName === ProcessTreeOperator.tau)
      ) {
        const g = parallel_block
          .append('g')
          .attr('transform', `translate(${offset_x + center}, ${offset_y})`);

        this.drawBlock(block, g);

        this.drawLine(
          parallel_block,
          BPMN_Constant.rectDiagLen + interpolate.x,
          BPMN_Constant.bpmn_node_height_width / 2 + interpolate.y,
          offset_x + center,
          BPMN_Constant.bpmn_node_height_width / 2 + offset_y,
          false,
          model._pt.frozen
        );

        this.drawLine(
          parallel_block,
          offset_x + center + block.width,
          BPMN_Constant.bpmn_node_height_width / 2 + offset_y,
          2 * BPMN_Constant.rectDiagLen +
            model.core_width +
            2 * BPMN_Constant.HORIZONTALSPACING +
            interpolate.y,
          BPMN_Constant.bpmn_node_height_width / 2 + interpolate.y,
          interpolate.y > 0,
          model._pt.frozen
        );

        // Draw a skip-line in the tau case
      } else {
        this.drawSkipLine(
          parallel_block,
          block,
          BPMN_Constant.rectDiagLen + interpolate.x,
          BPMN_Constant.bpmn_node_height_width / 2 + interpolate.y,
          2 * BPMN_Constant.rectDiagLen +
            model.core_width +
            2 * BPMN_Constant.HORIZONTALSPACING +
            interpolate.y,
          BPMN_Constant.bpmn_node_height_width / 2 + offset_y,
          false,
          model._pt.frozen
        );
      }

      offset_y += block.height + BPMN_Constant.VERTICALSPACING;
    }

    if (model.members.length === 0) {
      this.drawLine(
        parallel_block,
        2 * BPMN_Constant.rectDiagLen,
        BPMN_Constant.bpmn_node_height_width / 2,
        offset_x + BPMN_Constant.HORIZONTALSPACING,
        BPMN_Constant.bpmn_node_height_width / 2,
        false,
        model._pt.frozen
      );
    }

    const leave_operator = parallel_block
      .append('g')
      .attr(
        'transform',
        `translate(${
          model.core_width +
          2 * BPMN_Constant.rectDiagLen +
          2 * BPMN_Constant.HORIZONTALSPACING
        }, 0)`
      );

    this.drawOperatorNode(leave_operator, model);
  }

  deleteSelected() {
    const delete_subtree = (tree: ProcessTree, tree_to_delete: ProcessTree) => {
      if (tree === tree_to_delete) {
        return;
      } else {
        if (tree.children) {
          let child_list: Array<ProcessTree> = [];

          for (let child of tree.children) {
            let res = delete_subtree(child, tree_to_delete);

            if (res) {
              child_list.push(res);
            }
          }

          tree.children = child_list;
        }
      }

      return tree;
    };

    if (this.currentTree === this.selectedNode.datum()) {
      this.processTreeService.set_currentDisplayedProcessTree_with_Cache(null);
    } else {
      this.processTreeService.set_currentDisplayedProcessTree_with_Cache(
        delete_subtree(this.currentTree, this.selectedNode.datum())
      );
    }
  }

  deleteInactive() {
    return (
      this.selectedRootID == null ||
      this.nodeSelectionStrategy == this.NodeSeletionStrategy.NODE
    );
  }

  drawChoiceBlock(
    model: ChoiceBlock,
    selection: d3.Selection<any, any, any, any>
  ) {
    const choiceblock = selection;

    const enter_operator = choiceblock.append('g');
    this.drawOperatorNode(enter_operator, model);

    let offset_x =
      BPMN_Constant.HORIZONTALSPACING + 2 * BPMN_Constant.rectDiagLen;

    let offset_y = 0;
    let interpolate_along_diag;

    if (model.members.length > 1) {
      interpolate_along_diag = [...model.members.keys()].map((i) => {
        return {
          y:
            BPMN_Constant.rectDiagLen -
            (BPMN_Constant.rectDiagLen / (model.members.length - 1)) * i,
          x: (BPMN_Constant.rectDiagLen / (model.members.length - 1)) * i,
        };
      });
    } else {
      interpolate_along_diag = [{ y: 0, x: BPMN_Constant.rectDiagLen }];
    }

    for (let block of model.members) {
      const interpolate = interpolate_along_diag.pop();

      const center = (model.core_width - block.width) / 2;

      if (
        !(block instanceof Event && block.eventName === ProcessTreeOperator.tau)
      ) {
        const g = choiceblock
          .append('g')
          .attr('transform', `translate(${offset_x + center}, ${offset_y})`);

        this.drawBlock(block, g);

        this.drawLine(
          choiceblock,
          BPMN_Constant.rectDiagLen + interpolate.x,
          BPMN_Constant.bpmn_node_height_width / 2 + interpolate.y,
          offset_x + center,
          BPMN_Constant.bpmn_node_height_width / 2 + offset_y,
          false,
          model._pt.frozen
        );

        this.drawLine(
          choiceblock,
          offset_x + center + block.width,
          BPMN_Constant.bpmn_node_height_width / 2 + offset_y,
          2 * BPMN_Constant.rectDiagLen +
            model.core_width +
            2 * BPMN_Constant.HORIZONTALSPACING +
            interpolate.y,
          BPMN_Constant.bpmn_node_height_width / 2 + interpolate.y,
          interpolate.y > 0,
          model._pt.frozen
        );
      } else {
        this.drawSkipLine(
          choiceblock,
          block,
          BPMN_Constant.rectDiagLen + interpolate.x,
          BPMN_Constant.bpmn_node_height_width / 2 + interpolate.y,
          2 * BPMN_Constant.rectDiagLen +
            model.core_width +
            2 * BPMN_Constant.HORIZONTALSPACING +
            interpolate.y,
          BPMN_Constant.bpmn_node_height_width / 2 + offset_y,
          false,
          model._pt.frozen
        );
      }

      offset_y += block.height + BPMN_Constant.VERTICALSPACING;
    }

    if (model.members.length === 0) {
      this.drawLine(
        choiceblock,
        2 * BPMN_Constant.rectDiagLen,
        BPMN_Constant.bpmn_node_height_width / 2,
        offset_x + BPMN_Constant.HORIZONTALSPACING,
        BPMN_Constant.bpmn_node_height_width / 2,
        false,
        model._pt.frozen
      );
    }

    const leave_operator = choiceblock
      .append('g')
      .attr(
        'transform',
        `translate(${
          model.core_width +
          2 * BPMN_Constant.rectDiagLen +
          2 * BPMN_Constant.HORIZONTALSPACING
        }, 0)`
      );

    this.drawOperatorNode(leave_operator, model);
  }

  drawLoopBlock(model: LoopBlock, selection: d3.Selection<any, any, any, any>) {
    const loop_block = selection;

    const enter_operator = loop_block.append('g');
    this.drawOperatorNode(enter_operator, model);

    let offset_x =
      BPMN_Constant.HORIZONTALSPACING + 2 * BPMN_Constant.rectDiagLen;

    let offset_y = 0;

    if (model.members.length > 0) {
      const do_block = model.members[0];

      let center = (model.core_width - do_block.width) / 2;

      let g = loop_block
        .append('g')
        .attr('transform', `translate(${offset_x + center}, ${offset_y})`);

      if (
        !(
          do_block instanceof Event &&
          do_block.eventName === ProcessTreeOperator.tau
        )
      ) {
        this.drawBlock(do_block, g);

        this.drawLine(
          loop_block,
          2 * BPMN_Constant.rectDiagLen,
          BPMN_Constant.bpmn_node_height_width / 2,
          offset_x + center,
          BPMN_Constant.bpmn_node_height_width / 2 + offset_y,
          false,
          model._pt.frozen
        );

        this.drawLine(
          loop_block,
          offset_x + center + do_block.width,
          BPMN_Constant.bpmn_node_height_width / 2 + offset_y,
          2 * BPMN_Constant.rectDiagLen +
            model.core_width +
            2 * BPMN_Constant.HORIZONTALSPACING,
          BPMN_Constant.bpmn_node_height_width / 2,
          false,
          model._pt.frozen
        );
      } else {
        this.drawSkipLine(
          loop_block,
          do_block,
          2 * BPMN_Constant.rectDiagLen,
          BPMN_Constant.bpmn_node_height_width / 2,
          2 * BPMN_Constant.rectDiagLen +
            model.core_width +
            2 * BPMN_Constant.HORIZONTALSPACING,
          BPMN_Constant.bpmn_node_height_width / 2 + offset_y,
          false,
          model._pt.frozen
        );
      }

      offset_y += do_block.height + BPMN_Constant.VERTICALSPACING;

      if (model.members.length > 1) {
        const redo_block = model.members[1];

        center = (model.core_width - redo_block.width) / 2;

        if (
          !(
            redo_block instanceof Event &&
            redo_block.eventName === ProcessTreeOperator.tau
          )
        ) {
          g = loop_block
            .append('g')
            .attr('transform', `translate(${offset_x + center}, ${offset_y})`);

          this.drawBlock(redo_block, g);

          this.drawLine(
            loop_block,
            offset_x + center,
            BPMN_Constant.bpmn_node_height_width / 2 + offset_y,
            BPMN_Constant.rectDiagLen,
            BPMN_Constant.bpmn_node_height_width / 2 +
              BPMN_Constant.rectDiagLen,
            true,
            model._pt.frozen
          );

          this.drawLine(
            loop_block,
            3 * BPMN_Constant.rectDiagLen +
              model.core_width +
              2 * BPMN_Constant.HORIZONTALSPACING,
            BPMN_Constant.bpmn_node_height_width / 2 +
              BPMN_Constant.rectDiagLen,
            offset_x + center + redo_block.width + 6,
            BPMN_Constant.bpmn_node_height_width / 2 + offset_y,
            false,
            model._pt.frozen
          );
        } else {
          this.drawSkipLine(
            loop_block,
            redo_block,
            3 * BPMN_Constant.rectDiagLen +
              model.core_width +
              2 * BPMN_Constant.HORIZONTALSPACING,
            BPMN_Constant.bpmn_node_height_width / 2 +
              BPMN_Constant.rectDiagLen,
            BPMN_Constant.rectDiagLen,
            BPMN_Constant.bpmn_node_height_width / 2 + offset_y,
            true,
            model._pt.frozen
          );
        }
      }
    }

    if (model.members.length === 0) {
      this.drawLine(
        loop_block,
        2 * BPMN_Constant.rectDiagLen,
        BPMN_Constant.bpmn_node_height_width / 2,
        offset_x + BPMN_Constant.HORIZONTALSPACING,
        BPMN_Constant.bpmn_node_height_width / 2,
        false,
        model._pt.frozen
      );
    }

    const leave_operator = loop_block
      .append('g')
      .attr(
        'transform',
        `translate(${
          model.core_width +
          2 * BPMN_Constant.rectDiagLen +
          2 * BPMN_Constant.HORIZONTALSPACING
        }, 0)`
      );

    this.drawOperatorNode(leave_operator, model);
  }

  drawOperatorNode(parent, model: Block_Structured_BPMN) {
    // Determine operator Label:

    const label = model instanceof ParallelBlock ? '\u002b' : '\u2613';

    parent.datum(model._pt).classed('cursor-pointer', true);

    let color;

    color = BPMN_Constant.bpmn_operator_color;

    const op = parent
      .append('rect')
      .attr('width', BPMN_Constant.bpmn_node_height_width)
      .attr('height', BPMN_Constant.bpmn_node_height_width)
      .attr('fill', color)
      .attr('stroke', BPMN_Constant.bpmn_stroke_color)
      .attr('stroke-width', BPMN_Constant.bpmn_stroke_width)
      .attr(
        'transform',
        `translate(${
          BPMN_Constant.rectDiagLen - BPMN_Constant.rectCenter
        },0), rotate(45)`
      )
      .attr(
        'transform-origin',
        `${BPMN_Constant.rectCenter} ${BPMN_Constant.rectCenter}`
      )
      .classed('frozen-node-operator', model._pt.frozen);

    parent.on(
      'click',
      function (e, d) {
        if (d.id === this.selectedRootID) {
          this.processTreeService.selectedRootNodeID = null;
          this.performanceService.treeSelection.next(undefined);
        } else {
          this.processTreeService.selectedRootNodeID = d.id;
          this.performanceService.treeSelection.next(ProcessTree.fromObj(d));
        }
      }.bind(this)
    );

    parent.on('contextmenu', function (e, d) {
      console.warn('Right Click on:', e, d, this);
    });

    parent
      .append('text')
      .classed('user-select-none', true)
      .attr(
        'transform',
        `translate(${BPMN_Constant.rectDiagLen}, ${BPMN_Constant.rectCenter})`
      )
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', BPMN_Constant.bpmn_operator_font_size)
      .attr('fill', 'white')
      .text(label);
  }

  private hasPerformance(d) {
    return (
      d.performance?.service_time ||
      d.performance?.cycle_time ||
      d.performance?.waiting_time ||
      d.performance?.idle_time
    );
  }

  addToolTip(node) {
    node
      .attr('data-bs-toggle', 'tooltip')
      .attr('data-bs-placement', 'top')
      .attr('data-bs-title', (d) => {
        if (this.hasPerformance(d)) {
          return (
            `<div style="display: flex; justify-content: space-between" class="performance-tooltip-header-style bg-dark">
      <h6 style="flex: 1" class="performance-tooltip-header">` +
            (d.label || d.operator) +
            `</h6>
    </div>` +
            getPerformanceTable(
              d.performance,
              this.selectedPerformanceIndicator,
              this.selectedStatistic
            )
          );
        }

        return d.label || d.operator;
      })
      .attr('data-bs-template', (d) => {
        if (this.hasPerformance(d)) {
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
  }

  drawSequenceBlock(
    model: SequenceBlock,
    selection: d3.Selection<any, any, any, any>
  ) {
    const seq_block = selection;

    let offset_x = 0;

    model.members.forEach((block, index, array) => {
      const g = seq_block
        .append('g')
        .attr('transform', `translate(${offset_x}, 0)`);

      this.drawBlock(block, g);
      offset_x += block.width;

      if (index < array.length - 1) {
        this.drawLine(
          seq_block,
          offset_x,
          BPMN_Constant.bpmn_node_height_width / 2,
          offset_x + BPMN_Constant.HORIZONTALSPACING,
          BPMN_Constant.bpmn_node_height_width / 2,
          false,
          model._pt.frozen
        );
        offset_x += BPMN_Constant.HORIZONTALSPACING;
      }
    });
  }

  createArrowHeadMarker() {
    d3.select(this.svgElem.nativeElement)
      .append('svg:defs')
      .append('svg:marker')
      .attr('id', 'arrow-grey')
      .attr('refX', 3)
      .attr('refY', 3)
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('orient', 'auto')
      .attr('markerUnits', 'strokeWidth')
      .append('path')
      .attr('d', 'M 0 0 6 3 0 6 1.5 3')
      .attr('fill', BPMN_Constant.bpmn_stroke_color);

    d3.select(this.svgElem.nativeElement)
      .append('svg:defs')
      .append('svg:marker')
      .attr('id', 'arrow-red')
      .attr('refX', 3)
      .attr('refY', 3)
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('orient', 'auto')
      .attr('markerUnits', 'strokeWidth')
      .append('path')
      .attr('d', 'M 0 0 6 3 0 6 1.5 3')
      .attr('fill', 'red');
  }

  drawLine(selection, x1, y1, x2, y2, outBound = false, frozen = false) {
    // Compute a right-angled-cornered Line

    const lineData: Array<[number, number]> = outBound
      ? [
          [x1, y1],
          [x2, y1],
          [x2, y2 + 3],
        ]
      : [
          [x1, y1],
          [x1, y2],
          [x2 - 3, y2],
        ];

    const line = selection
      .append('path')
      .attr('d', d3.line()(lineData))
      .attr('fill', 'None')
      .attr('stroke-width', '1')
      .attr('stroke', BPMN_Constant.bpmn_stroke_color)
      .style('stroke-linejoin', 'round')
      .attr('marker-end', 'url(#arrow-grey)')
      .classed('frozen-edge', frozen);
  }

  drawSkipLine(
    selection,
    model,
    x1,
    y1,
    x2,
    y2,
    outBound = false,
    frozen = false
  ) {
    // Compute a right-angled-cornered Line
    const lineData: Array<[number, number]> = outBound
      ? [
          [x1, y1],
          [x1, y2],
          [x2, y2],
          [x2, y1 + 3],
        ]
      : [
          [x1, y1],
          [x1, y2],
          [x2 - 3, y2],
          [x2 - 3, y1],
        ];

    const line = selection
      .append('path')
      .attr('d', d3.line()(lineData))
      .attr('fill', 'None')
      .attr('stroke-width', '1')
      .attr('stroke', BPMN_Constant.bpmn_stroke_color)
      .style('stroke-linejoin', 'round')
      .attr('marker-end', 'url(#arrow-grey)')
      .classed('frozen-edge', frozen);

    line.datum(model._pt);
    line.attr('id', model._pt.id);
  }

  drawEvent(model: Event, selection) {
    const node = selection
      .append('rect')
      .attr('stroke-width', 1)
      .attr('stroke', BPMN_Constant.bpmn_stroke_color)
      .attr('rx', 3)
      .attr('ry', 3);

    node.datum(model._pt);

    node.classed('frozen-node-visible-activity', model._pt.frozen);
    selection.classed('cursor-pointer', true);

    let color;

    if (this.currentTree.performance) {
      if (
        this.performanceColorMap.has(model._pt.id) &&
        model._pt.performance?.[this.selectedPerformanceIndicator]?.[
          this.selectedStatistic
        ] !== undefined
      ) {
        color = this.performanceColorMap.get(model._pt.id)(
          model._pt.performance[this.selectedPerformanceIndicator][
            this.selectedStatistic
          ]
        );
      } else {
        color = '#404040';
      }
    } else {
      color =
        model._pt.label !== '\u03C4'
          ? this.activityColorMap.get(model._pt.label)
          : BPMN_Constant.bpmn_non_visible_activity_color;
    }

    const text_color =
      model.eventName === ProcessTreeOperator.tau || model._pt.frozen
        ? 'White'
        : textColorForBackgroundColor(color);

    const width = model.width;

    if (model.eventName === ProcessTreeOperator.tau) {
      node
        .attr('width', width)
        .attr('height', BPMN_Constant.bpmn_node_height_width)
        .attr('fill', color);
    } else {
      node
        .attr('width', width)
        .attr('height', BPMN_Constant.bpmn_node_height_width)
        .attr('fill', color);
    }

    selection.on(
      'click',
      function (e, d) {
        if (d.id === this.selectedRootID) {
          this.processTreeService.selectedRootNodeID = null;
          this.performanceService.treeSelection.next(undefined);
        } else {
          this.processTreeService.selectedRootNodeID = d.id;
          this.performanceService.treeSelection.next(ProcessTree.fromObj(d));
        }
      }.bind(this)
    );

    const activityText = selection
      .append('text')
      .attr('x', width / 2)
      .attr('y', BPMN_Constant.bpmn_node_height_width / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', 12)
      .attr('fill', text_color);

    const tspan = activityText
      .append('tspan')
      .attr('x', width / 2)
      .attr('y', BPMN_Constant.bpmn_node_height_width / 2);

    if (model.eventName) {
      // shorten text if it is too long
      if (model.eventName.length <= 20) {
        tspan.text(model.eventName);
      } else {
        tspan.text(model.eventName.substring(0, 20) + '...');
      }
    }

    this.addToolTip(selection);
  }

  freezeSubtree() {

  const markNodeAsFrozen = (node) => {
    node.frozen = true;
    if (node.children) {
      node.children.forEach((child) => {
        markNodeAsFrozen(child);
      });
    }
  };

  const markNodeAsNonFrozen = (node) => {
    node.frozen = false;

    if (node.parent && node.parent.frozen) {
      markNodeAsNonFrozen(node.parent);
      return;
    }
    if (node.children) {
      node.children.forEach((child) => {
        markNodeAsNonFrozen(child);
      });
    }
  };
  if (!this.selectedNode.datum().frozen) {
    markNodeAsFrozen(this.selectedNode.datum());
  } else {
    markNodeAsNonFrozen(this.selectedNode.datum());
  }

  this.processTreeService.set_currentDisplayedProcessTree_with_Cache(this.currentTree)

  }

  buttonFreezeSubtreeDisabled() {
    return (
      this.selectedRootID == null ||
      this.nodeSelectionStrategy == this.NodeSeletionStrategy.NODE
    );
  }

  drawStart(parent) {
    parent
      .classed('cursor-pointer', true)
      .attr('id', this.currentTree.id)
      .datum(this.currentTree);

    parent
      .append('circle')
      .attr('r', BPMN_Constant.START_END_RADIUS)
      .attr('fill', BPMN_Constant.bpmn_operator_color)
      .attr('stroke', BPMN_Constant.bpmn_stroke_color)
      .attr('stroke-width', 1);

    parent.on(
      'click',
      function (e, d) {
        if (d.id === this.selectedRootID) {
          this.processTreeService.selectedRootNodeID = null;
          this.performanceService.treeSelection.next(undefined);
        } else {
          this.processTreeService.selectedRootNodeID = d.id;
          this.performanceService.treeSelection.next(ProcessTree.fromObj(d));
        }
      }.bind(this)
    );
  }

  drawEnd(parent) {
    parent
      .classed('cursor-pointer', true)
      .attr('id', this.currentTree.id)
      .datum(this.currentTree);

    parent
      .append('circle')
      .attr('r', BPMN_Constant.START_END_RADIUS)
      .attr('fill', BPMN_Constant.bpmn_operator_color)
      .attr('stroke', BPMN_Constant.bpmn_stroke_color)
      .attr('stroke-width', BPMN_Constant.bpmn_stroke_width);

    parent
      .append('circle')
      .attr('r', BPMN_Constant.START_END_RADIUS - 2)
      .attr('fill', BPMN_Constant.bpmn_operator_color)
      .attr('stroke', BPMN_Constant.bpmn_stroke_color)
      .attr('stroke-width', BPMN_Constant.bpmn_stroke_width);

    parent.on(
      'click',
      function (e, d) {
        if (d.id === this.selectedRootID) {
          this.processTreeService.selectedRootNodeID = null;
          this.performanceService.treeSelection.next(undefined);
        } else {
          this.processTreeService.selectedRootNodeID = d.id;
          this.performanceService.treeSelection.next(ProcessTree.fromObj(d));
        }
      }.bind(this)
    );
  }

  addZoomFunctionality(): void {
    this.mainGroup.attr(
      'transform',
      `translate(${
        3 * BPMN_Constant.HORIZONTALSPACING + 2 * BPMN_Constant.START_END_RADIUS
      }, ${this.bpmnContainerElem.nativeElement.offsetHeight / 2})`
    );

    const zooming = function (event) {
      this.mainGroup.attr(
        'transform',
        event.transform.translate(
          3 * BPMN_Constant.HORIZONTALSPACING +
            2 * BPMN_Constant.START_END_RADIUS,
          this.bpmnContainerElem.nativeElement.offsetHeight / 2
        )
      );
    }.bind(this);

    this.zoom = d3.zoom().scaleExtent([0.1, 3]).on('zoom', zooming);
    d3.select(this.svgElem.nativeElement)
      .call(this.zoom)
      .on('dblclick.zoom', null);
  }

  reset_zoom(animation: boolean = true): void {
    const rTime = animation ? 250 : 0;

    d3.select(this.svgElem.nativeElement)
      .transition()
      .duration(rTime)
      .ease(d3.easeExpInOut)
      .call(
        this.zoom.transform,
        d3.zoomIdentity.translate(
          -(this.bpmnContainerElem.nativeElement.offsetWidth / 2) +
            3 * BPMN_Constant.HORIZONTALSPACING +
            2 * BPMN_Constant.START_END_RADIUS,
          0
        )
      );
  }

  centerContent(): void {}

  exportBPMN(svg: SVGGraphicsElement): void {
    console.log('BPMN', svg);
    console.log('Container', this.svgElem.nativeElement);
    console.log('BPMN', this.mainGroup.node());

    // Copy the current tree
    const bpmn_copy = svg.cloneNode(true) as SVGGraphicsElement;
    const svgBBox = (this.mainGroup.node() as SVGGraphicsElement).getBBox();

    // Strip all the classed information
    const bpmn = d3.select(bpmn_copy);

    console.log('BPMN Selected', bpmn);

    bpmn
      .selectAll('g')
      .attr('data-bs-toggle', 'none')
      .attr('data-bs-placement', 'none')
      .attr('data-bs-title', 'none')
      .attr('data-bs-html', 'none')
      .attr('data-bs-template', 'none');

    bpmn
      .select('#bpmn-zoom-group')
      .attr(
        'transform',
        `translate(${
          3 * BPMN_Constant.HORIZONTALSPACING +
          2 * BPMN_Constant.START_END_RADIUS
        }, ${2 * BPMN_Constant.VERTICALSPACING})`
      );

    // Export the BPMN
    this.imageExportService.export(
      'bpmn_diagram',
      svgBBox.width +
        5 * BPMN_Constant.HORIZONTALSPACING +
        4 * BPMN_Constant.START_END_RADIUS,
      svgBBox.height + 4 * BPMN_Constant.VERTICALSPACING,
      bpmn_copy
    );
  }
}

export namespace BpmnEditorComponent {
  export const componentName = 'BpmnEditorComponent';

  export function drawSequenceBlock(model: SequenceBlock) {
    throw new Error('Function not implemented.');
  }
}
