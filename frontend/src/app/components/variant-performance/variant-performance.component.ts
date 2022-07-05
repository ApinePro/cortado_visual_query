import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, Renderer2 } from '@angular/core';
import { VariantPerformanceService } from 'src/app/services/variant-performance.service';
import { VariantElement } from '../variant-explorer/model';
import { LayoutChangeDirective } from '../../directives/layout-change.directive';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';

@Component({
  selector: 'app-variant-performance',
  templateUrl: './variant-performance.component.html',
  styleUrls: ['./variant-performance.component.scss'],
})
export class VariantPerformanceComponent extends LayoutChangeDirective implements OnInit {

  constructor(
    public variantPerformanceService: VariantPerformanceService,
    private changeDetectorRef: ChangeDetectorRef,
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

  public selectedVariantElement: VariantElement;

  public colorScale;

  ngOnInit(): void {
    this.variantPerformanceService.selectedVariantElement$.subscribe(
      (variantElement) => {
        this.selectedVariantElement = variantElement;
        this.changeDetectorRef.markForCheck();
      }
    );
  }

  setPerformanceMode(performanceMode: boolean): void {
    this.variantPerformanceService.variantPerformanceMode.next(performanceMode);
  }
}


export namespace VariantPerformanceComponent {
  export const componentName = 'VariantPerformanceComponent';
}