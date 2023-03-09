import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Renderer2,
} from '@angular/core';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';
import { LayoutChangeDirective } from 'src/app/directives/layout-change/layout-change.directive';
import { VariantPerformanceService } from 'src/app/services/variant-performance.service';
import { VariantViewModeService } from 'src/app/services/viewModeServices/variant-view-mode.service';

@Component({
  selector: 'app-lpm-metrics-tab',
  templateUrl: './lpm-metrics-tab.component.html',
  styleUrls: ['./lpm-metrics-tab.component.css'],
})
export class LpmMetricsTabComponent extends LayoutChangeDirective {
  constructor(
    renderer: Renderer2,
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    elRef: ElementRef
  ) {
    super(elRef.nativeElement, renderer);
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
}

export namespace LpmMetricsTabComponent {
  export const componentName = 'LpmMetricsTabComponent';
}
