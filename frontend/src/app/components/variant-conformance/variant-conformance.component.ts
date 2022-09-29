import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
} from '@angular/core';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';
import { LayoutChangeDirective } from 'src/app/directives/layout-change/layout-change.directive';
import { ConformanceCheckingService } from 'src/app/services/conformanceChecking/conformance-checking.service';

@Component({
  selector: 'app-variant-conformance',
  templateUrl: './variant-conformance.component.html',
  styleUrls: ['./variant-conformance.component.css'],
})
export class VariantConformanceComponent extends LayoutChangeDirective {
  constructor(
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    elRef: ElementRef,
    renderer: Renderer2,
    private conformanceCheckingService: ConformanceCheckingService
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

  public performanceStats: any;
  public colorScale;
  public title;

  public get conformanceColorMapValues() {
    const min = this.conformanceCheckingService.conformanceColorMap.domain()[0];
    const max = this.conformanceCheckingService.conformanceColorMap.domain()[1];
    const increment =
      (max - min) /
      this.conformanceCheckingService.conformanceColorMap.range().length;

    return this.conformanceCheckingService.conformanceColorMap
      .range()
      .map((v, i) => {
        const t = min + i * increment;

        return {
          lowerBound: t * 100,
          color: v,
        };
      })
      .concat([
        {
          lowerBound: max * 100,
          color: null,
        },
      ]);
  }
}

export namespace VariantConformanceComponent {
  export const componentName = 'VariantConformanceComponent';
}
