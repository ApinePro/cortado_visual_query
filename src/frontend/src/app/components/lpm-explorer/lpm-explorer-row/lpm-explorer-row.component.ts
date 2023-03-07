import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import * as d3 from 'd3';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PT_Constant } from 'src/app/constants/process_tree_drawer_constants';
import { ProcessTreeDrawerDirective } from 'src/app/directives/process-tree-drawer/process-tree-drawer.directive';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer/variant-drawer.directive';
import { LocalProcessModelWithPatterns } from 'src/app/objects/LocalProcessModelWithPatterns';
import {
  ProcessTree,
  ProcessTreeOperator,
} from 'src/app/objects/ProcessTree/ProcessTree';
import { InfixType } from 'src/app/objects/Variants/infix_selection';
import { Variant } from 'src/app/objects/Variants/variant';
import {
  VariantElement,
  LeafNode,
} from 'src/app/objects/Variants/variant_element';
import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';
import { LazyLoadingServiceService } from 'src/app/services/lazyLoadingService/lazy-loading.service';
import { textColorForBackgroundColor } from 'src/app/utils/render-utils';
import { contextMenuCallback } from '../../variant-explorer/functions/variant-drawer-callbacks';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-lpm-explorer-row]',
  templateUrl: './lpm-explorer-row.component.html',
  styleUrls: ['./lpm-explorer-row.component.scss'],
})
export class LpmExplorerRowComponent implements AfterViewInit {
  @Input()
  lpm: LocalProcessModelWithPatterns;

  @ViewChild('row')
  rowElement: ElementRef;

  @ViewChild('lpmContainer')
  lpmSvg: ElementRef;

  @Input()
  rootElement: ElementRef;

  @ViewChild(VariantDrawerDirective)
  variantDrawer: VariantDrawerDirective;

  @ViewChild(ProcessTreeDrawerDirective)
  processTreeDrawer: ProcessTreeDrawerDirective;

  processTreeInSvg;
  openContextCallback = contextMenuCallback.bind(this);
  InfixType = InfixType;

  constructor(
    private lazyLoadingService: LazyLoadingServiceService,
    private colorMapService: ColorMapService
  ) {}

  isVisible: boolean = false;
  activityColorMap: Map<string, string>;
  private _destroy$ = new Subject();
  lpmColumnSize = 0;
  treeSvgHeight = '0px';

  ngAfterViewInit(): void {
    const self = this;
    // TODO remove
    this.isVisible = true;
    this.processTreeInSvg = d3.select('d3-svg-directive');

    let obs = new ResizeObserver((entries) => {
      for (let entry of entries) {
        this.lpmColumnSize = entry.contentRect.width;
      }
    });
    obs.observe(this.lpmSvg.nativeElement);

    this.colorMapService.colorMap$
      .pipe(takeUntil(this._destroy$))
      .subscribe((colorMap) => {
        this.activityColorMap = colorMap;
      });

    this.processTreeDrawer.redraw(this.lpm.lpm);

    let height = this.getHeightOfLpm(this.lpm.lpm);
    let treeSvgHeightN =
      height * (PT_Constant.BASE_HEIGHT_WIDTH + 2 * 3) +
      (height - 1) * PT_Constant.NODE_SPACING;
    this.treeSvgHeight = treeSvgHeightN + 'px';

    // this.lazyLoadingService.addSubPattern(
    //   this.rowElement.nativeElement.parentNode,
    //   this.rootElement,
    //   (isIntersecting) => {
    //     self.isVisible = isIntersecting;
    //   }
    // );
  }

  computeTextColor = (d: d3.HierarchyNode<ProcessTree>) => {
    if (d.data.label === ProcessTreeOperator.tau) {
      return 'white';
    }
    const nodeColor = this.computeNodeColor(d);

    const isVisibleActivity =
      d.data.label !== null && d.data.label !== ProcessTreeOperator.tau;
    return isVisibleActivity ? textColorForBackgroundColor(nodeColor) : 'white';
  };

  computeNodeColor = (d: d3.HierarchyNode<ProcessTree>) => {
    if (d.data.operator !== null) return PT_Constant.OPERATOR_COLOR;
    if (d.data.label === '...') return 'gray';
    if (d.data.label !== null && d.data.label === ProcessTreeOperator.tau)
      return PT_Constant.INVISIBLE_ACTIVTIY_COLOR;
    const isVisibleActivity =
      d.data.label !== null && d.data.label !== ProcessTreeOperator.tau;

    return isVisibleActivity ? this.activityColorMap.get(d.data.label) : null;
  };

  computeActivityColor = (
    self: VariantDrawerDirective,
    element: VariantElement,
    variant: Variant
  ) => {
    let color;

    if (element instanceof LeafNode) {
      color = this.activityColorMap.get(element.asLeafNode().activity[0]);

      if (element.activity.length > 1) {
        color = '#d3d3d3'; // lightgray
      }
    } else {
      color = '#d3d3d3';
    }

    return color;
  };

  selectNodeCallBack = (self, event, d) => {
    console.log(this.treeSvgHeight);
  };

  tooltipContent = (d: d3.HierarchyNode<ProcessTree>) => {
    return '';
  };

  getHeightOfLpm(processTree: ProcessTree) {
    if (processTree.children.length == 0) {
      return 1;
    }
    let childHeights = [];
    for (let child of processTree.children) {
      childHeights.push(this.getHeightOfLpm(child));
    }

    return 1 + Math.max(...childHeights);
  }
}
