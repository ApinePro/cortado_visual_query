import { PT_Constant } from './../../constants/process_tree_drawer_constants';
import { ProcessTreeService } from 'src/app/services/processTreeService/process-tree.service';
import {
  Directive,
  ElementRef,
  Input,
  createComponent,
  ViewContainerRef,
  ComponentFactoryResolver,
} from '@angular/core';
import {
  ProcessTree,
  ProcessTreeOperator,
} from 'src/app/objects/ProcessTree/ProcessTree';
import { flextree } from 'd3-flextree';

import * as d3 from 'd3';
import { ModelViewModeService } from 'src/app/services/viewModeServices/model-view-mode.service';
import { ViewMode } from 'src/app/objects/ViewMode';
import { VariantService } from '../../services/variantService/variant.service';
import { getBootstrapTooltipsAllowList } from '../../components/process-tree-editor/utils';
import { QueryTreeLeafNodeComponent } from 'src/app/components/query-tree-leaf-node/query-tree-leaf-node.component';
import {
  getLowestSelectionActionableElement,
  InfixType,
  SelectableState,
} from 'src/app/objects/Variants/infix_selection';
import { VARIANT_Constants } from './../../constants/variant_element_drawer_constants';

import {
  EventEmitter,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { Selection } from 'd3';
import { PolygonGeneratorService } from 'src/app/services/polygon-generator.service';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import {
  VariantElement,
  SequenceGroup,
  ParallelGroup,
  ChoiceGroup,
  FallthroughGroup,
  LeafNode,
  WaitingTimeNode,
  InvisibleSequenceGroup,
  LoopGroup,
  SkipGroup,
  ParallelPattern,
  SequencePattern,
  CardinalityOperator,
  CardinalityDirection,
} from 'src/app/objects/Variants/variant_element';
import { textColorForBackgroundColor } from 'src/app/utils/render-utils';
import { VariantViewModeService } from 'src/app/services/viewModeServices/variant-view-mode.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IVariant } from 'src/app/objects/Variants/variant_interface';
import { threadId } from 'worker_threads';
import { ConformanceCheckingService } from 'src/app/services/conformanceChecking/conformance-checking.service';
import { QueryTree } from 'src/app/objects/ProcessTree/QueryTree';

@Directive({
  selector: '[appQueryTreeDrawer]',
})
export class QueryTreeDrawerDirective {
  nodeEnter: any;

  root: d3.HierarchyNode<any>;
  mainSvgGroup: any;

  processTreeSyntaxInfo: any;
  selectedRootNode: any;

  constructor(
    elRef: ElementRef,
    private processTreeService: ProcessTreeService,
    private modelViewModeService: ModelViewModeService,
    private variantService: VariantService,
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private polygonService: PolygonGeneratorService,
    private sharedDataService: SharedDataService, //edited
    private variantViewModeService: VariantViewModeService,
    private conformanceCheckingService: ConformanceCheckingService
  ) {
    this.mainSvgGroup = d3.select(elRef.nativeElement);
    this.svgHtmlElement = elRef;
  }
  svgHtmlElement: ElementRef;
  @Input()
  traceInfixSelectionMode: boolean = false;

  @Input()
  infixType: InfixType;

  @Input()
  computeActivityColor: (
    drawerDirective: QueryTreeDrawerDirective,
    element: VariantElement,
    variant: IVariant
  ) => string;

  @Input()
  onClickCbFc: (
    drawerDirective: QueryTreeDrawerDirective,
    element: VariantElement,
    variant: IVariant
  ) => void;

  @Input()
  onMouseOverCbFc: (
    drawerDirective: QueryTreeDrawerDirective,
    element: VariantElement,
    variant: IVariant,
    selection
  ) => void;

  @Input()
  onRightMouseClickCbFc: (
    drawerDirective: QueryTreeDrawerDirective,
    element: VariantElement,
    variant: IVariant,
    event: Event
  ) => void;

  @Input()
  computeNodeColor;

  @Input()
  computeTextColor;

  @Input()
  colorMap: Map<string, string>;

  @Input()
  tooltipText;

  @Input()
  onClickCallBack;

  @Input()
  keepStandardView: boolean = false;

  @Input()
  addCursorPointer: boolean = true;

  @Output()
  selection = new EventEmitter<Selection<any, any, any, any>>();

  svgSelection!: Selection<any, any, any, any>;

  redraw(tree: ProcessTree) {
    //console.log(tree);
    if (tree) {
      this.root = d3.hierarchy(tree, (d) => {
        // @ts-ignore
        return d.children;
      });
    } else {
      this.root = null;
    }

    // synchronization between update of node width cache and process tree rendering
    setTimeout(() => this.update(this.root), 0);
  }

  drawNodes(node: d3.Selection<any, any, any, any>) {
    const myDefaultAllowList = getBootstrapTooltipsAllowList();

    // add node groups
    this.nodeEnter = node
      .enter()
      .append('g')
      .attr('id', (d) => {
        return d.data.id;
      })
      .classed('cursor-pointer', true)
      .attr('data-bs-toggle', 'tooltip')
      .attr('data-bs-placement', 'top')
      .attr('whiteList', myDefaultAllowList)
      .attr('data-bs-title', (d) => this.tooltipText(d))
      .attr('data-bs-template', (d) => {
        if (
          (this.modelViewModeService.viewMode === ViewMode.PERFORMANCE &&
            d.data.hasPerformance() &&
            d.data.label !== ProcessTreeOperator.tau) ||
          (this.modelViewModeService.viewMode === ViewMode.CONFORMANCE &&
            d.data.conformance !== null)
        ) {
          return `<div class="tooltip performance-tooltip" role="tooltip">
                <div class="tooltip-arrow"></div>
                <div class="tooltip-inner p-0" style="max-width: none; border-radius: 15px;"></div>
              </div>`;
        }

        return `<div class="tooltip" role="tooltip">
              <div class="tooltip-arrow"></div>
              <div class="tooltip-inner"></div>
            </div>`;
      })
      .attr('data-bs-html', true);

    // manually trigger tooltip through jquery
    this.nodeEnter.on('mouseenter', (e: PointerEvent, data) => {
      // @ts-ignore
      this.variantService.activityTooltipReference = $(e.target);
      this.variantService.activityTooltipReference.tooltip('show');
    });

    // add nodes
    this.nodeEnter
      .append('rect')
      .classed('node', true)
      .attr('rx', PT_Constant.CORNER_RADIUS)
      .attr('ry', PT_Constant.CORNER_RADIUS)
      .attr('stroke', PT_Constant.STROKE_COLOR)
      .attr('stroke-width', PT_Constant.STROKE_WIDTH)
      .merge(node.select('.node'))
      .style('fill', (d) => this.computeNodeColor(d))
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
      .classed('node-invisible-activity', (d: any) => {
        return d.data.label === ProcessTreeOperator.tau;
      })
      .classed('frozen-node-invisible-activity', (d: any) => {
        return (
          d.data.label === ProcessTreeOperator.tau && d.data.frozen === true
        );
      })
      .classed('negation', (d: any) => {
        return d.data.negation === true;
      })
      .attr('width', PT_Constant.BASE_HEIGHT_WIDTH)
      .attr('height', PT_Constant.BASE_HEIGHT_WIDTH)
      .attr('font-size', (d: any) => {
        if (d.data.label === ProcessTreeOperator.tau)
          return PT_Constant.INVISIBLE_FONT_SIZE;
        return '';
      })
      .attr('x', function (d: any) {
        return d.y;
      })
      .attr('y', function (d: any) {
        return d.x - PT_Constant.BASE_HEIGHT_WIDTH / 2;
      });

    // add node text
    this.nodeEnter
      .append('text')
      .classed('user-select-none', true)
      .classed('node-text', true)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .merge(node.select('text'))
      .attr('fill', (d) => this.computeTextColor(d))
      .attr('font-size', (d: any) => {
        if (d.data.operator) {
          return PT_Constant.OPERATOR_FONT_SIZE;
        }
        return PT_Constant.VISIBLE_FONT_SIZE;
      })
      .text((d: any) => {
        if (d.data.pattern) {
          console.log("start draw pattern in node");
          this.variantRedraw(
            d.data.id,
            d.data.pattern,
            d.y,
            d.x - PT_Constant.BASE_HEIGHT_WIDTH / 2
          );
          if (d.parent) {
            this.translateNextSiblings(d);
          }
          return '';
        } else {
          console.log(d.data);
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
        }
      })
      .attr('x', function (d: any) {
        return d.y + PT_Constant.BASE_HEIGHT_WIDTH / 2 + 3;
      })
      .attr('y', function (d: any) {
        return d.x;
      });

    //this.svgSelection = this.nodeEnter;
    this.svgSelection = this.mainSvgGroup;

    //update the width, height and siblings positions according to variant after insertion
    d3.selectAll('.node')
      .attr('width', (d: any) => {
        if (d.data.pattern) {
          return d.data.pattern.getWidth() + 2 * VARIANT_Constants.MARGIN_X;
        } else {
          return PT_Constant.BASE_HEIGHT_WIDTH;
        }
      })
      .attr('height', (d: any) => {
        if (d.data.pattern) {
          return d.data.pattern.getHeight() + 2 * VARIANT_Constants.MARGIN_Y;
        } else {
          return PT_Constant.BASE_HEIGHT_WIDTH;
        }
      })
      .attr('x', function (d: any) {
        return d.y;
      })
      .attr('y', function (d: any) {
        return d.x - PT_Constant.BASE_HEIGHT_WIDTH / 2;
      });

    this.nodeEnter
      .filter((d: any) => {
        //console.log(d);
        return d.data.negation == true;
      })
      .append('path')
      .attr('d', function (d: any) {
        let length,
          width = 0;
        if (d.data.pattern) {
          //console.log(d.data.pattern);
          width = d.data.pattern.getWidth() + 2 * VARIANT_Constants.MARGIN_X;
          length = d.data.pattern.getHeight() + 2 * VARIANT_Constants.MARGIN_Y;
        } else {
          width = PT_Constant.BASE_HEIGHT_WIDTH;
          length = PT_Constant.BASE_HEIGHT_WIDTH;
        }
        let baseWid = d.y;
        let baseLen = d.x - PT_Constant.BASE_HEIGHT_WIDTH / 2;

        return d3.line()([
          [baseWid, baseLen],
          [baseWid + width, baseLen + length],
        ]);
      })
      .attr('fill', 'red')
      .attr('stroke-width', '3')
      .attr('stroke', 'red');

    // resize leaf nodes if text is too long
    this.nodeEnter
      .merge(node)
      .select('.node-visible-activity')
      .attr('x', function (d) {
        return (
          d.x -
          Math.max(
            PT_Constant.BASE_HEIGHT_WIDTH,
            this.nextSibling.getComputedTextLength() + 10
          ) /
            2
        );
      })
      .attr('width', function () {
        return Math.max(
          PT_Constant.BASE_HEIGHT_WIDTH,
          this.nextSibling.getComputedTextLength() + 10
        );
      });

    // remove nodes
    node.exit().transition().duration(50).remove();
  }

  translateNextSiblings(node) {
    const siblings = node.parent.children;
    //console.log('siblings');
    //console.log(siblings);
    const nodeIndex = siblings.indexOf(node);
    let i = siblings.length - 1;
    while (i > nodeIndex) {
      siblings[i].x =
        siblings[i].x +
        node.data.pattern.getHeight() -
        PT_Constant.BASE_HEIGHT_WIDTH;
      i -= 1;
    }
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
        return d.source.y + PT_Constant.BASE_HEIGHT_WIDTH;
      })
      .attr('y1', function (d: any) {
        return d.source.x;
      })
      .attr('x2', function (d: any) {
        return d.target.y;
      })
      .attr('y2', function (d: any) {
        if (d.target.data.pattern) {
          return (
            d.target.x +
            (d.target.data.pattern.getHeight() -
              PT_Constant.BASE_HEIGHT_WIDTH) /
              2
          );
        } else {
          return d.target.x;
        }
      })
      .attr('stroke', PT_Constant.STROKE_COLOR)
      .classed('frozen-edge', (d) => {
        return d.source.data.frozen;
      });
  }

  update(root): void {
    this.mainSvgGroup.selectAll('g').remove();
    //console.log('updating tree');
    if (root) {
      // add node groups that contain a rectangle and text
      this.calculateTreeLayout(root);
      const node = this.mainSvgGroup
        .selectAll('g')
        .data(root.descendants(), function (d) {
          return d.data.id;
        });
      // Draw Nodes
      this.drawNodes(node);

      // Draw Edges
      this.drawEdges(root);

      this.addSelectionFunctionality();
    } else {
      this.selectedRootNode = null;
      this.mainSvgGroup.selectAll('*').remove();
    }
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
            PT_Constant.BASE_HEIGHT_WIDTH,
            2 * PT_Constant.BASE_HEIGHT_WIDTH,
          ];
        }

        return [
          this.processTreeService.nodeWidthCache[node.data.label],
          2 * PT_Constant.BASE_HEIGHT_WIDTH,
        ];
      });

      // Specifies the spacing between two nodes
      flextreeLayout.spacing((nodeA, nodeB) => {
        return nodeA.parent === nodeB.parent
          ? PT_Constant.NODE_SPACING
          : 2 * PT_Constant.NODE_SPACING;
      });

      // calculate layout
      flextreeLayout(root);
    }
  }

  addSelectionFunctionality(): void {
    this.nodeEnter.on('click', (e: PointerEvent, data) => {
      this.onClickCallBack(this, e, data);
      e.stopPropagation();
    });
  }

  loadComponent(pattern) {
    this.viewContainerRef.clear();
    const componentRef = this.viewContainerRef.createComponent(
      QueryTreeLeafNodeComponent
    );
    componentRef.instance.currentVariant = pattern;
    componentRef.instance.color = this.colorMap;
    componentRef.instance.infixType = InfixType.NOT_AN_INFIX;
  }

  //Variant drawer part
  variantRedraw(id, variant, x, y): void {
    //console.log('variant redraw');
    //console.log(variant);
    this.mainSvgGroup
      .select(`[id='${id}']`)
      .selectAll('node-variant-svg')
      .remove();
    if (variant) {
      const height = variant.recalculateHeight(
        !this.keepStandardView &&
          this.variantViewModeService.viewMode === ViewMode.PERFORMANCE
      );
      const width = variant.recalculateWidth(
        !this.keepStandardView &&
          this.variantViewModeService.viewMode === ViewMode.PERFORMANCE
      );

      if (
        !this.keepStandardView &&
        this.variantViewModeService.viewMode === ViewMode.CONFORMANCE &&
        variant.alignment
      ) {
        const height = variant.alignment.recalculateHeight(false);
        const width = variant.alignment.recalculateWidth(false);
      }

      const svg_container = this.mainSvgGroup
        .select(`[id='${id}']`)
        .classed('node-variant-svg', true)
        .append('g')
        .attr(
          'transform',
          `translate(${x + VARIANT_Constants.MARGIN_X}, ${
            y + VARIANT_Constants.MARGIN_Y
          })`
        );
      //console.log(svg_container);

      //for parallel group-like chevrons
      variant.updateWidth(
        !this.keepStandardView &&
          this.variantViewModeService.viewMode === ViewMode.PERFORMANCE
      );

      const [svg, width_offset] = this.handleInfix(
        this.infixType,
        height,
        width,
        svg_container
      );

      svg_container
        .attr('width', width + width_offset)
        .attr('height', height + 2 * VARIANT_Constants.SELECTION_STROKE_WIDTH);

      /*
      if (
        !this.keepStandardView &&
        this.variantViewModeService.viewMode === ViewMode.CONFORMANCE &&
        variant.alignment
      )
        this.draw(variant.alignment, svg, true, variant);
      else this.draw(variant, svg, true, variant);*/
      //this.draw(variant, svg, true, variant); ???

      this.draw(variant, svg_container, true, variant);

      if (
        variant instanceof SequenceGroup &&
        (this.keepStandardView ||
          this.variantViewModeService.viewMode !== ViewMode.PERFORMANCE)
      ) {
        this.mainSvgGroup
      .select(`[id='${id}']`)
      .select('polygon').style('fill', 'transparent');
      }

      this.selection.emit(this.svgSelection);
    }
  }

  private handleInfix(
    infixType,
    height: number,
    width: number,
    parentSvg = null
  ): [any, number] {
    let width_offset = 0;

    const PREFIX_OFFSET = 35;
    const POSTFIX_OFFSET = 25;

    const svg = parentSvg;
    //console.log(svg);
    const variant_svg = svg
      .append('g')
      .attr('width', width)
      .attr('height', height);

    const height_offset = (height - 2 * VARIANT_Constants.MARGIN_Y) / 2 - 7.65;
    switch (infixType) {
      case InfixType.NOT_AN_INFIX:
        break;

      case InfixType.POSTFIX:
        width_offset = POSTFIX_OFFSET;
        break;

      case InfixType.PREFIX:
        width_offset = PREFIX_OFFSET;
        break;

      case InfixType.PROPER_INFIX:
        width_offset = PREFIX_OFFSET + POSTFIX_OFFSET;
        break;
    }

    svg.attr('width', width + width_offset).attr('height', height);

    if (
      infixType === InfixType.POSTFIX ||
      infixType === InfixType.PROPER_INFIX
    ) {
      variant_svg.attr(
        'transform',
        `translate(${PREFIX_OFFSET}, ${VARIANT_Constants.SELECTION_STROKE_WIDTH})`
      );

      svg
        .append('g')
        .attr('transform', `translate(0, ${height_offset})`)
        .append('use')
        .attr('href', '#infixDots')
        .attr('transform', 'scale(1.7)');
    } else {
      variant_svg.attr(
        'transform',
        `translate(0, ${VARIANT_Constants.SELECTION_STROKE_WIDTH})`
      );
    }

    if (
      infixType === InfixType.PREFIX ||
      infixType === InfixType.PROPER_INFIX
    ) {
      svg
        .append('g')
        .attr(
          'transform',
          `translate(${
            width + (infixType === InfixType.PROPER_INFIX ? PREFIX_OFFSET : 0)
          }, ${height_offset})`
        )
        .append('use')
        .attr('href', '#infixDots')
        .attr('transform', 'scale(1.7)');
    }

    return [variant_svg, width_offset];
  }

  fadeColor(color: string) {
    if (color.startsWith('#')) {
      color = color.substring(1);
    }
    let num = parseInt(color, 16);

    let r = (num >> 16) + 30;
    let g = ((num >> 8) & 0xff) + 30;
    let b = (num & 0xff) + 30;

    r = Math.min(Math.max(r, 0), 255);
    g = Math.min(Math.max(g, 0), 255);
    b = Math.min(Math.max(b, 0), 255);

    let newColor =
      '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

    return newColor;
  }

  draw(
    element: VariantElement,
    svgElement: Selection<any, any, any, any>,
    outerElement: boolean,
    nodeVariant
  ): void {
    //console.log(svgElement);
    svgElement.datum(element).classed('variant-element-group', true);

    if (outerElement) {
      //what is outerelement here?
      svgElement.datum(element);
    }

    if (element instanceof ParallelGroup) {
      this.drawParallelGroup(
        element.asParallelGroup(),
        svgElement,
        nodeVariant
      );
    } else if (element instanceof ChoiceGroup) {
      this.drawChoiceGroup(element.asChoiceGroup(), svgElement, nodeVariant);
    } else if (element instanceof FallthroughGroup) {
      this.drawFallthroughGroup(
        element.asFallthroughGroup(),
        svgElement,
        nodeVariant
      );
    } else if (element instanceof SequenceGroup) {
      this.drawSequenceGroup(
        element.asSequenceGroup(),
        svgElement,
        outerElement,
        nodeVariant
      );
    } else if (element instanceof LeafNode) {
      this.drawLeafNode(element.asLeafNode(), svgElement, nodeVariant);
    }
  }

  drawSequenceGroup(
    element: SequenceGroup,
    parent: Selection<any, any, any, any>,
    outerElement: boolean,
    nodeVariant //largest variant??
  ): void {
    const width = element.asPattern().getWidth();
    const height = element.asPattern().getHeight();

    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    const color = 'lightgrey';

    let laElement = getLowestSelectionActionableElement(element);
    let actionable =
      laElement.parent !== null &&
      laElement.infixSelectableState !== SelectableState.None;

    if (
      element.asPattern().verticalCardi > 0 ||
      element.asPattern().horizontalCardi > 0
    ) {
      parent
        .append('rect')
        .classed('cardinality-region', true)
        .attr('width', width)
        .attr('height', height)
        .attr('rx', 10)
        .attr('ry', 10)
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .classed('dashbox', true)
        .classed('cursor-pointer', true);
    }

    let polygon = this.createPolygon(
      parent,
      polygonPoints,
      color,
      actionable,
      true
    );

    if (
      element.asPattern().verticalCardi > 0 ||
      element.asPattern().horizontalCardi > 0
    ) {
      polygon.style('fill', 'transparent');
    }

    if (
      this.traceInfixSelectionMode &&
      element.parent &&
      !(element instanceof InvisibleSequenceGroup)
    ) {
      this.addInfixSelectionAttributes(element, polygon, false);
    }

    if (
      element instanceof InvisibleSequenceGroup ||
      element.parent instanceof SkipGroup
    ) {
      polygon.style('fill', 'transparent');
    } else {
      if (this.onClickCbFc) {
        parent.on('click', (e: PointerEvent) => {
          this.onClickCbFc(this, element, nodeVariant);
          e.stopPropagation();
        });
      }
    }

    let xOffset = VARIANT_Constants.MARGIN_X; //edited

    if (
      element.asPattern().verticalCardi > 0 ||
      element.asPattern().horizontalCardi > 0
    ) {
      xOffset =
        xOffset + VARIANT_Constants.MARGIN_X + VARIANT_Constants.CARDI_MARGIN_X;
    }

    if (!outerElement) {
      xOffset +=
        element.getHeadLength() +
        element.getMarginX() -
        element.elements[0].getHeadLength();
    }

    if (
      element.asPattern().verticalCardi > 0 ||
      element.asPattern().horizontalCardi > 0
    ) {
      const cardinalityText = parent
        .append('text')
        .attr(
          'x',
          element.asPattern().verticalCardi > 0 ||
            element.asPattern().horizontalCardi > 0
            ? width / 2
            : width
        )
        .attr(
          'y',
          element.asPattern().verticalCardi > 0 ||
            element.asPattern().horizontalCardi > 0
            ? (VARIANT_Constants.MARGIN_Y + VARIANT_Constants.CARDI_MARGIN_Y) /
                2
            : 0
        )
        .classed('user-select-none', true)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', VARIANT_Constants.FONT_SIZE)
        .attr('fill', 'white')
        .classed('activity-text', true);

      const tspan = cardinalityText
        .append('tspan')
        .classed(
          'cursor-pointer',
          (!this.traceInfixSelectionMode || actionable) && this.addCursorPointer
        );
      if(element.asPattern().verticalCardi > 0){
        tspan.text('⇕ ' +
        element.asPattern().verticalCardiOp +
        ' ' +
        element.asPattern().verticalCardi)
      }
      else {
        tspan.text('⇔ ' +
        element.asPattern().horizontalCardiOp +
        ' ' +
        element.asPattern().horizontalCardi)
      }
    }

    for (const child of element.elements) {
      if (
        child instanceof WaitingTimeNode &&
        (this.keepStandardView ||
          this.variantViewModeService.viewMode !== ViewMode.PERFORMANCE)
      ) {
        continue;
      }
      const childWidth = child.getWidth(
        !this.keepStandardView &&
          this.variantViewModeService.viewMode === ViewMode.PERFORMANCE
      );
      const childHeight = child.getHeight();
      const yOffset = height / 2 - childHeight / 2;
      const g = parent
        .append('g')
        .attr('transform', `translate(${xOffset}, ${yOffset})`);

      this.draw(child, g, false, nodeVariant);
      xOffset += childWidth;
    }

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, nodeVariant, parent);
    }

    if (this.onRightMouseClickCbFc) {
      parent.on('contextmenu', (e: PointerEvent) => {
        this.onRightMouseClickCbFc(this, element, nodeVariant, e);
        e.stopPropagation();
      });
    }
  }

  drawParallelGroup(
    element: ParallelGroup,
    parent: Selection<any, any, any, any>,
    nodeVariant
  ): void {
    const width = element.getWidth();
    const height = element.getHeight();

    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    let laElement = getLowestSelectionActionableElement(element);
    let actionable =
      laElement.parent !== null &&
      laElement.infixSelectableState !== SelectableState.None;

    //console.log(element);
    //add cardinality dashed box
    if (
      element.asPattern().verticalCardi > 0 ||
      element.asPattern().horizontalCardi > 0
    ) {
      parent
        .append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('rx', 10)
        .attr('ry', 10)
        .attr('fill', 'none')
        .attr('stroke-dasharray', '5,5')
        .classed('dashbox', true)
        .classed('cursor-pointer', true);
    }

    const color = 'lightgrey';
    let polygon = this.createPolygon(
      parent,
      polygonPoints,
      color,
      actionable,
      true
    );

    if (
      element.asPattern().verticalCardi > 0 ||
      element.asPattern().horizontalCardi > 0
    ) {
      polygon.style('fill', 'transparent');
    }

    if (
      this.traceInfixSelectionMode &&
      !(element instanceof InvisibleSequenceGroup)
    ) {
      this.addInfixSelectionAttributes(element, polygon, false);
    }

    if (this.onClickCbFc) {
      parent.on('click', (e: PointerEvent) => {
        this.onClickCbFc(this, element, nodeVariant);
        e.stopPropagation();
      });
    }

    if (this.onRightMouseClickCbFc) {
      parent.on('contextmenu', (e: PointerEvent) => {
        this.onRightMouseClickCbFc(this, element, nodeVariant, e);
        e.stopPropagation();
      });
    }

    //.attr('y', -VARIANT_Constants.FONT_SIZE)
    if (
      element.asPattern().verticalCardi > 0 ||
      element.asPattern().horizontalCardi > 0
    ) {
      const cardinalityText = parent
        .append('text')
        .attr('x', width / 2)
        .attr(
          'y',
          element.asPattern().verticalCardi > 0 ||
            element.asPattern().horizontalCardi > 0
            ? VARIANT_Constants.CARDI_MARGIN_Y - VARIANT_Constants.FONT_SIZE / 2
            : -VARIANT_Constants.FONT_SIZE
        )
        .classed('user-select-none', true)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', VARIANT_Constants.FONT_SIZE)
        .attr('fill', 'white')
        .classed('activity-text', true);

      const tspan = cardinalityText
        .append('tspan')
        .classed(
          'cursor-pointer',
          (!this.traceInfixSelectionMode || actionable) && this.addCursorPointer
        );
      if(element.asPattern().verticalCardi > 0){
        tspan.text('⇕ ' +
        element.asPattern().verticalCardiOp +
        ' ' +
        element.asPattern().verticalCardi)
      }
      else {
        tspan.text('⇔ ' +
        element.asPattern().horizontalCardiOp +
        ' ' +
        element.asPattern().horizontalCardi)
      }
    }

    let y = VARIANT_Constants.MARGIN_Y;
    if (
      element.asPattern().verticalCardi > 0 ||
      element.asPattern().horizontalCardi > 0
    ) {
      y += VARIANT_Constants.CARDI_MARGIN_Y;
    }

    for (const child of element.elements) {
      if (
        child instanceof WaitingTimeNode &&
        (this.keepStandardView ||
          this.variantViewModeService.viewMode !== ViewMode.PERFORMANCE)
      ) {
        continue;
      }

      const height = child.getHeight();
      const x = element.getHeadLength() + 0.5 * VARIANT_Constants.MARGIN_X;
      const g = parent.append('g').attr('transform', `translate(${x}, ${y})`);
      this.draw(child, g, false, nodeVariant);
      y += height + VARIANT_Constants.MARGIN_Y;
    }

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, nodeVariant, parent);
    }
  }

  drawChoiceGroup(
    element: ChoiceGroup,
    parent: Selection<any, any, any, any>,
    nodeVariant
  ): void {
    const width = element.getWidth();
    const height = element.getHeight();

    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    let laElement = getLowestSelectionActionableElement(element);
    let actionable =
      laElement.parent !== null &&
      laElement.infixSelectableState !== SelectableState.None;

    if (element.asPattern().verticalCardi > 0) {
      parent
        .append('rect')
        .attr('width', width + 30)
        .attr('height', height + 20)
        .attr('rx', 10)
        .attr('ry', 10)
        .attr('fill', 'none')
        .attr('transform', 'translate(-15, -10)')
        .attr('stroke-dasharray', '5,5')
        .classed('dashbox', true)
        .classed('cursor-pointer', true);
    }

    const color = 'lightgrey';
    let polygon = this.createPolygon(
      parent,
      polygonPoints,
      color,
      actionable,
      true
    );

    if (
      this.traceInfixSelectionMode &&
      !(element instanceof InvisibleSequenceGroup)
    ) {
      this.addInfixSelectionAttributes(element, polygon, false);
    }

    if (this.onClickCbFc) {
      parent.on('click', (e: PointerEvent) => {
        this.onClickCbFc(this, element, nodeVariant);
        e.stopPropagation();
      });
    }

    if (this.onRightMouseClickCbFc) {
      parent.on('contextmenu', (e: PointerEvent) => {
        this.onRightMouseClickCbFc(this, element, nodeVariant, e);
        e.stopPropagation();
      });
    }

    let y = VARIANT_Constants.MARGIN_Y;

    //edited
    const textcolor = textColorForBackgroundColor(
      color,
      this.traceInfixSelectionMode && !element.selected
    );

    const v_height = element.getHeight();
    const v_width = element.getWidth();

    const activityText = parent
      .append('text')
      .attr('x', v_width / 2)
      .attr('y', v_height / 2)
      .classed('user-select-none', true)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr(
        'font-size',
        (VARIANT_Constants.LEAF_HEIGHT + VARIANT_Constants.MARGIN_Y) *
          element.elements.length +
          VARIANT_Constants.MARGIN_Y
      )
      .attr('font-weight', 300)
      .attr('fill', textcolor)
      .classed('activity-text', true);

    const tspan_infront = activityText
      .append('tspan')
      .attr(
        'x',
        element.getHeadLength() +
          0.5 *
            (((VARIANT_Constants.LEAF_HEIGHT + VARIANT_Constants.MARGIN_Y) *
              element.elements.length +
              VARIANT_Constants.MARGIN_Y) /
              2.8) +
          0.5 * VARIANT_Constants.MARGIN_X
      )
      .attr('y', v_height / 2)
      .classed(
        'cursor-pointer',
        (!this.traceInfixSelectionMode || actionable) && this.addCursorPointer
      )
      .text('{');

    for (const child of element.elements) {
      if (
        child instanceof WaitingTimeNode &&
        (this.keepStandardView ||
          this.variantViewModeService.viewMode !== ViewMode.PERFORMANCE)
      ) {
        continue;
      }

      const height = child.getHeight();
      const x =
        element.getHeadLength() +
        0.5 * VARIANT_Constants.MARGIN_X +
        ((VARIANT_Constants.LEAF_HEIGHT + VARIANT_Constants.MARGIN_Y) *
          element.elements.length +
          VARIANT_Constants.MARGIN_Y) /
          2.8;
      const g = parent.append('g').attr('transform', `translate(${x}, ${y})`);
      this.draw(child, g, false, nodeVariant);
      y += height + VARIANT_Constants.MARGIN_Y;
    }

    const tspan_behind = activityText
      .append('tspan')
      .attr(
        'x',
        element.getWidth() -
          element.getHeadLength() -
          0.5 * VARIANT_Constants.MARGIN_X -
          0.5 *
            (((VARIANT_Constants.LEAF_HEIGHT + VARIANT_Constants.MARGIN_Y) *
              element.elements.length +
              VARIANT_Constants.MARGIN_Y) /
              2.8)
      )
      .attr('y', v_height / 2)
      .classed(
        'cursor-pointer',
        (!this.traceInfixSelectionMode || actionable) && this.addCursorPointer
      )
      .text('}');

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, nodeVariant, parent);
    }
  }

  drawFallthroughGroup(
    element: FallthroughGroup,
    parent: Selection<any, any, any, any>,
    nodeVariant
  ): void {
    const width = element.getWidth();
    const height = element.getHeight();

    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    let laElement = getLowestSelectionActionableElement(element);
    let actionable =
      laElement.parent !== null &&
      laElement.infixSelectableState !== SelectableState.None;

    if (element.asPattern().verticalCardi > 0) {
      parent
        .append('rect')
        .attr('width', width + 30)
        .attr('height', height + 20)
        .attr('rx', 10)
        .attr('ry', 10)
        .attr('fill', 'none')
        .attr('transform', 'translate(-15, -10)')
        .attr('stroke-dasharray', '5,5')
        .classed('dashbox', true)
        .classed('cursor-pointer', true);
    }

    const color = 'lightgrey';
    let polygon = this.createFallthroughPolygon(
      parent,
      polygonPoints,
      color,
      actionable,
      true
    );

    if (
      this.traceInfixSelectionMode &&
      !(element instanceof InvisibleSequenceGroup)
    ) {
      this.addInfixSelectionAttributes(element, polygon, false);
    }

    if (this.onClickCbFc) {
      parent.on('click', (e: PointerEvent) => {
        this.onClickCbFc(this, element, nodeVariant);
        e.stopPropagation();
      });
    }

    if (this.onRightMouseClickCbFc) {
      parent.on('contextmenu', (e: PointerEvent) => {
        this.onRightMouseClickCbFc(this, element, nodeVariant, e);
        e.stopPropagation();
      });
    }

    let y = VARIANT_Constants.MARGIN_Y;

    for (const child of element.elements) {
      if (
        child instanceof WaitingTimeNode &&
        (this.keepStandardView ||
          this.variantViewModeService.viewMode !== ViewMode.PERFORMANCE)
      ) {
        continue;
      }

      const height = child.getHeight();
      const x = element.getHeadLength() + 0.5 * VARIANT_Constants.MARGIN_X;
      const g = parent.append('g').attr('transform', `translate(${x}, ${y})`);
      this.draw(child, g, false, nodeVariant);
      y += height + VARIANT_Constants.MARGIN_Y;
    }

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, nodeVariant, parent);
    }
  }

  private createPolygon(
    parent: d3.Selection<any, any, any, any>,
    polygonPoints: string,
    color: string,
    actionable: boolean,
    group = false
  ) {
    const poly = parent
      .append('polygon')
      .attr('points', polygonPoints)
      .style('fill', color)
      .classed(
        'cursor-pointer',
        (!this.traceInfixSelectionMode || actionable) && this.addCursorPointer
      );

    if (group) {
      poly.classed('chevron-group', true);
      poly.style('fill-opacity', 0.5).style('stroke-width', 2);
    }

    return poly;
  }

  private createFallthroughPolygon(
    parent: d3.Selection<any, any, any, any>,
    polygonPoints: string,
    color: string,
    actionable: boolean,
    group = false
  ) {
    const poly = parent
      .append('polygon')
      .attr('points', polygonPoints)
      .style('fill', color)
      .classed('cursor-pointer', !this.traceInfixSelectionMode || actionable);
    poly.classed('chevron-group', true);
    poly.style('stroke-width', 2);
    return poly;
  }

  public drawLeafNode(
    element: LeafNode,
    parent: Selection<any, any, any, any>,
    nodeVariant
  ): void {
    const width = element.getWidth();
    let height = element.getHeight();
    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    const color = this.computeActivityColor(this, element, nodeVariant);
    let laElement = getLowestSelectionActionableElement(element);

    let actionable =
      laElement.parent !== null &&
      laElement.infixSelectableState !== SelectableState.None;

    if (
      element.asLeafPattern().verticalCardi > 0 ||
      element.asPattern().horizontalCardi > 0
    ) {
      //console.log("draw leaf cardi");
      const lightColor = this.fadeColor(color);
      let stackPolygon = this.createPolygon(
        parent,
        polygonPoints,
        lightColor,
        actionable
      );
      stackPolygon.attr('transform', `translate(-10, -10)`);
    }
    let polygon = this.createPolygon(parent, polygonPoints, color, actionable);

    if (this.traceInfixSelectionMode) {
      this.addInfixSelectionAttributes(element, polygon, true);
    }

    const textcolor = textColorForBackgroundColor(
      color,
      this.traceInfixSelectionMode && !element.selected
    );

    const activityText = parent
      .append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .classed('user-select-none', true)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', VARIANT_Constants.FONT_SIZE)
      .attr('fill', textcolor)
      .classed('activity-text', true);

    if (
      element.asPattern().verticalCardi > 0 ||
      element.asPattern().horizontalCardi > 0
    ) {
      const cardinalityText = parent
        .append('text')
        .attr('x', width / 2)
        .attr('y', -VARIANT_Constants.FONT_SIZE)
        .classed('user-select-none', true)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', VARIANT_Constants.FONT_SIZE)
        .attr('fill', 'white')
        .classed('activity-text', true);

      const tspan = cardinalityText
        .append('tspan')
        .classed(
          'cursor-pointer',
          (!this.traceInfixSelectionMode || actionable) && this.addCursorPointer
        );
        if(element.asPattern().verticalCardi > 0){
          tspan.text('⇕ ' +
          element.asPattern().verticalCardiOp +
          ' ' +
          element.asPattern().verticalCardi)
        }
        else {
          tspan.text('⇔ ' +
          element.asPattern().horizontalCardiOp +
          ' ' +
          element.asPattern().horizontalCardi)
        }
    }

    let y = height / 2;
    if (element.activity.length > 1) {
      y =
        height / 2 -
        ((element.activity.length - 1) / 2) *
          (VARIANT_Constants.FONT_SIZE + VARIANT_Constants.MARGIN_Y);
    }

    let truncated = false;
    let dy = 0;

    element.activity.forEach((a, _i) => {
      const tspan = activityText
        .append('tspan')
        .attr('x', width / 2)
        .attr('y', y + dy)
        .classed(
          'cursor-pointer',
          (!this.traceInfixSelectionMode || actionable) && this.addCursorPointer
        )
        .text(a);

      dy += VARIANT_Constants.FONT_SIZE + VARIANT_Constants.MARGIN_Y;
      tspan.attr(
        'height',
        VARIANT_Constants.FONT_SIZE + VARIANT_Constants.MARGIN_Y
      );

      const maxWidth =
        element.getWidth() -
        element.getHeadLength() * 2 -
        VARIANT_Constants.MARGIN_X;
      const tr = this.wrapInnerLabelText(tspan, a, maxWidth);
      truncated ||= tr;

      if (a === 'W_Nabellen incomplete dossiers' && !tr) {
        console.log('Did not wrap', a, tspan, maxWidth);
      }
    });

    if (truncated) {
      activityText
        .attr('title', element.activity.join(';'))
        .attr('data-bs-toggle', 'tooltip');
      // manually trigger tooltip through jquery
      activityText.on('mouseenter', (e: PointerEvent, data) => {
        // @ts-ignore
        this.variantService.activityTooltipReference = $(e.target);
        this.variantService.activityTooltipReference.tooltip('show');
      });
    }

    if (this.onClickCbFc) {
      parent.on('click', (e: PointerEvent) => {
        this.onClickCbFc(this, element, nodeVariant);
        // hide the tooltip
        if (this.variantService.activityTooltipReference) {
          this.variantService.activityTooltipReference.tooltip('hide');
        }
        e.stopPropagation();
      });
    }

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, nodeVariant, parent);
    }
  }

  private addInfixSelectionAttributes(
    element: VariantElement,
    polygon: any,
    isLeafNode: boolean
  ) {
    if (
      !this.keepStandardView &&
      this.variantViewModeService.viewMode === ViewMode.PERFORMANCE
    )
      return;

    if (element.selected) {
      polygon.attr('stroke-opacity', '0.5');
      if (!element.isVisibleParentSelected())
        polygon.attr('stroke', '#ff0000').attr('stroke-width', '4px');
      return;
    }

    if (element.infixSelectableState !== SelectableState.Selectable) {
      polygon.style('fill-opacity', '0.1');
      return;
    }

    // element is selectable
    polygon
      .attr('stroke', '#ff0000')
      .attr('stroke-width', '1px')
      .attr('stroke-dasharray', 4);

    if (isLeafNode) {
      polygon.style('fill-opacity', '0.2');
    } else {
      polygon.style('fill', '#999999');
    }
  }

  private wrapInnerLabelText(
    textSelection: Selection<any, any, any, any>,
    text: string,
    maxWidth: number
  ): boolean {
    let textLength = this.getComputedTextLength(textSelection);
    //let textLength = textSelection.node().getBoundingClientRect().width;

    let truncated = false;
    while (textLength > maxWidth && text.length > 1) {
      text = text.slice(0, -1);
      if (text[text.length - 1] == ' ') {
        text = text.slice(0, -1);
      }
      textSelection.text(text + '..');
      textLength = this.getComputedTextLength(textSelection);
      //textLength = textSelection.node().getBoundingClientRect().width;
      truncated = true;
    }

    if (text === 'W_Nabellen incomplete dossiers' && !truncated) {
      console.log('Inner Text length after Wrap', text, textLength, maxWidth);
    }

    return truncated;
  }

  private getComputedTextLength(
    textSelection: Selection<any, any, any, any>
  ): number {
    let textLength;
    if (
      this.sharedDataService.computedTextLengthCache.has(textSelection.text())
    ) {
      textLength = this.sharedDataService.computedTextLengthCache.get(
        textSelection.text()
      );
    } else {
      textLength = textSelection.node().getBoundingClientRect().width;
      if (textLength == 0) {
        textLength =
          textSelection.text().length * VARIANT_Constants.CHAR_LENGTH;
      }
    }
    if (textLength > 0) {
      this.sharedDataService.computedTextLengthCache.set(
        textSelection.text(),
        textLength
      );
    }

    return textLength;
  }

  /*
  public resetCachedTextLength() {
    this.sharedDataService.computedTextLengthCache = new Map<string, number>();
    console.log('reset');
  }*/

  getSVGGraphicElement(): SVGGraphicsElement {
    return this.svgHtmlElement.nativeElement;
  }

  isExpanded(variant): boolean {
    return variant.variant.expanded;
  }

  setInspectVariant() {
    d3.select('.selected-polygon').classed('selected-polygon', false);
    d3.selectAll('.variant-polygon').classed(
      'cursor-pointer',
      !this.keepStandardView &&
        this.variantViewModeService.viewMode === ViewMode.PERFORMANCE &&
        this.addCursorPointer
    );
    d3.selectAll('.activity-text').classed(
      'cursor-pointer',
      !this.keepStandardView &&
        this.variantViewModeService.viewMode === ViewMode.PERFORMANCE &&
        this.addCursorPointer
    );
  }

  changeSelected(group: VariantElement) {
    d3.selectAll('.variant-element-group')
      .selectAll('polygon')
      .classed('selected-polygon', (d) => group === d);
  }
}
