import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LayoutChangeDirective } from 'src/app/directives/layout-change/layout-change.directive';
import { ProcessTreeDrawerDirective } from 'src/app/directives/process-tree-drawer/process-tree-drawer.directive';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer/variant-drawer.directive';
import { LocalProcessModelWithPatterns } from 'src/app/objects/LocalProcessModelWithPatterns';
import { InfixType } from 'src/app/objects/Variants/infix_selection';
import { Variant } from 'src/app/objects/Variants/variant';
import {
  VariantElement,
  LeafNode,
} from 'src/app/objects/Variants/variant_element';
import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';
import { LpmService } from 'src/app/services/lpmService/lpm.service';
import { contextMenuCallback } from '../variant-explorer/functions/variant-drawer-callbacks';

@Component({
  selector: 'app-lpm-explorer',
  templateUrl: './lpm-explorer.component.html',
  styleUrls: ['./lpm-explorer.component.scss'],
})
export class LpmExplorerComponent
  extends LayoutChangeDirective
  implements OnInit, OnDestroy
{
  lpms: LocalProcessModelWithPatterns[] = [];
  colorMap = null;

  @ViewChild(ProcessTreeDrawerDirective)
  processTreeDrawer: ProcessTreeDrawerDirective;

  InfixType = InfixType;

  openContextCallback = contextMenuCallback.bind(this);

  private _destroy$ = new Subject();

  constructor(
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    elRef: ElementRef,
    renderer: Renderer2,
    public lpmService: LpmService,
    public colorMapService: ColorMapService
  ) {
    super(elRef.nativeElement, renderer);
  }

  ngOnInit(): void {
    this.lpmService.localProcessModels$.subscribe((models) => {
      this.lpms = models;
      console.log(this.lpms);
    });

    this.colorMapService.colorMap$
      .pipe(takeUntil(this._destroy$))
      .subscribe((cMap) => {
        this.colorMap = cMap;
      });
  }

  handleResponsiveChange(
    left: number,
    top: number,
    width: number,
    height: number
  ): void {}
  handleVisibilityChange(visibility: boolean): void {}
  handleZIndexChange(
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void {}

  exportLocalProcessModels() {
    console.log('implement lpm export here');
  }

  computeActivityColor = (
    self: VariantDrawerDirective,
    element: VariantElement,
    variant: Variant
  ) => {
    let color;

    if (element instanceof LeafNode) {
      color = this.colorMap.get(element.asLeafNode().activity[0]);

      if (element.activity.length > 1) {
        color = '#d3d3d3'; // lightgray
      }
    } else {
      color = '#d3d3d3';
    }

    return color;
  };

  ngOnDestroy(): void {
    // TODO check niklas
    // this.lazyLoadingServiceService.destoryVariantMinerObserver();
    this._destroy$.next();
  }
}

export namespace LpmExplorerComponent {
  export const componentName = 'LpmExplorerComponent';
}
