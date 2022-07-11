import { Directive, ElementRef, Input, SimpleChanges } from '@angular/core';
import { ProcessTreeService } from 'src/app/services/processTreeService/process-tree.service';
import * as d3 from 'd3';
import { Block_Structured_BPMN, ChoiceBlock, convertPTtoBlockstructuredBPMN, LoopBlock, ParallelBlock, SequenceBlock, Event } from 'src/app/objects/BPMN/block-structured-bpmn';
import { BPMN_Constant } from 'src/app/constants/bpmn_model_drawer_constants';
import { getPerformanceTable } from 'src/app/components/process-tree-editor/utils';
import { ProcessTreeOperator } from 'src/app/objects/ProcessTree/ProcessTree';
import { textColorForBackgroundColor } from 'src/app/utils/helper_functions';

@Directive({
  selector: '[appBpmnDrawer]'
})
export class BpmnDrawerDirective{

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
  currentTree

  performanceActive : boolean = false; 
  mainGroup 

  constructor(
    elRef: ElementRef,
    private processTreeService : ProcessTreeService,
  ) {
    this.mainGroup = d3.select(elRef.nativeElement);
  }

  redraw(tree) {
    this.mainGroup.selectChildren().remove();

    

    if (tree) {

      this.performanceActive = tree.performance

      const model = convertPTtoBlockstructuredBPMN(
        tree,
        this.processTreeService.nodeWidthCache
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

      this.drawStart(start, tree, model._pt.frozen);

      this.drawLine(
        start,
        BPMN_Constant.START_END_RADIUS,
        0,
        BPMN_Constant.START_END_RADIUS + 2 * BPMN_Constant.HORIZONTALSPACING,
        0,
        false,
        model._pt.frozen
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

      this.drawEnd(end, tree, model._pt.frozen);

      this.drawLine(
        end,
        -(BPMN_Constant.START_END_RADIUS + 2 * BPMN_Constant.HORIZONTALSPACING),
        0,
        -BPMN_Constant.START_END_RADIUS,
        0,
        false,
        model._pt.frozen
      );

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
      (e: PointerEvent, data) => {
        this.onClickCallBack(this, e, data);
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
      .attr('marker-end', frozen ? 'url(#arrow-frozen)' : 'url(#arrow-grey)')
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
      .attr('marker-end', frozen ? 'url(#arrow-frozen)' : 'url(#arrow-grey)')
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

    if (this.performanceActive) {
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
      (e: PointerEvent, data) => {
        this.onClickCallBack(this, e, data);
    });

    const activityText = selection
      .append('text')
      .attr('x', width / 2)
      .attr('y', BPMN_Constant.bpmn_node_height_width / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', 12)
      .attr('fill', text_color)
      .classed('user-select-none', true);

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

  drawStart(parent, tree, frozen) {
    parent
      .classed('cursor-pointer', true)
      .attr('id', tree.id)
      .datum(tree);

    parent
      .append('circle')
      .attr('r', BPMN_Constant.START_END_RADIUS)
      .attr('fill', BPMN_Constant.bpmn_operator_color)
      .attr('stroke', BPMN_Constant.bpmn_stroke_color)
      .attr('stroke-width', 1)
      .classed('frozen-node-operator', frozen);

    parent.on(
      'click',
      (e: PointerEvent, data) => {
        this.onClickCallBack(this, e, data);
    });
  }

  drawEnd(parent, tree, frozen) {
    parent
      .classed('cursor-pointer', true)
      .attr('id', tree.id)
      .datum(tree);

    parent
      .append('circle')
      .attr('r', BPMN_Constant.START_END_RADIUS)
      .attr('fill', BPMN_Constant.bpmn_operator_color)
      .attr('stroke', BPMN_Constant.bpmn_stroke_color)
      .attr('stroke-width', BPMN_Constant.bpmn_stroke_width)
      .classed('frozen-node-operator', frozen);

    parent
      .append('circle')
      .attr('r', BPMN_Constant.START_END_RADIUS - 2)
      .attr('fill', BPMN_Constant.bpmn_operator_color)
      .attr('stroke', BPMN_Constant.bpmn_stroke_color)
      .attr('stroke-width', BPMN_Constant.bpmn_stroke_width)
      .classed('frozen-node-operator', frozen);

      parent.on(
        'click',
        (e: PointerEvent, data) => {
          this.onClickCallBack(this, e, data);
      });
  }
}
