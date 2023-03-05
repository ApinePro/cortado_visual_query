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
import {
  ProcessTree,
  ProcessTreeOperator,
} from 'src/app/objects/ProcessTree/ProcessTree';
import { VariantElement } from 'src/app/objects/Variants/variant_element';
import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';
import { LazyLoadingServiceService } from 'src/app/services/lazyLoadingService/lazy-loading.service';
import { textColorForBackgroundColor } from 'src/app/utils/render-utils';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-lpm-explorer-row]',
  templateUrl: './lpm-explorer-row.component.html',
  styleUrls: ['./lpm-explorer-row.component.scss'],
})
export class LpmExplorerRowComponent implements AfterViewInit {
  @Input()
  lpm;

  @Input()
  nPatterns: number;

  @Input()
  pattern: VariantElement;

  @ViewChild('row')
  rowElement: ElementRef;

  @Input()
  rootElement: ElementRef;

  @Input()
  showLpm: boolean;

  @ViewChild(VariantDrawerDirective)
  variantDrawer: VariantDrawerDirective;

  @ViewChild(ProcessTreeDrawerDirective)
  processTreeDrawer: ProcessTreeDrawerDirective;

  processTreeInSvg;

  constructor(
    private lazyLoadingService: LazyLoadingServiceService,
    private colorMapService: ColorMapService
  ) {}

  isVisible: boolean = false;
  activityColorMap: Map<string, string>;
  private _destroy$ = new Subject();

  ngAfterViewInit(): void {
    const self = this;
    // TODO remove
    this.isVisible = true;
    this.processTreeInSvg = d3.select('d3-svg-directive');

    this.colorMapService.colorMap$
      .pipe(takeUntil(this._destroy$))
      .subscribe((colorMap) => {
        this.activityColorMap = colorMap;
      });

    if (this.showLpm) {
      this.processTreeDrawer.redraw(this.lpm);
    }

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

  tooltipContent = (d: d3.HierarchyNode<ProcessTree>) => {
    return '';
  };
}
