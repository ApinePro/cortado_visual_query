import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Tab } from 'bootstrap';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LayoutChangeDirective } from 'src/app/directives/layout-change/layout-change.directive';
import { ViewMode } from 'src/app/objects/ViewMode';
import { ConformanceCheckingService } from 'src/app/services/conformanceChecking/conformance-checking.service';
import { VariantViewModeService } from 'src/app/services/viewModeServices/variant-view-mode.service';

@Component({
  selector: 'app-variant-conformance',
  templateUrl: './variant-conformance.component.html',
  styleUrls: ['./variant-conformance.component.css'],
})
export class VariantConformanceComponent
  extends LayoutChangeDirective
  implements AfterViewInit, OnDestroy
{
  @ViewChild('colorMapTab') colorMapTab: ElementRef;

  private _destroy$ = new Subject();

  constructor(
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    elRef: ElementRef,
    renderer: Renderer2,
    private conformanceCheckingService: ConformanceCheckingService,
    private variantViewModeService: VariantViewModeService
  ) {
    super(elRef.nativeElement, renderer);
  }

  ngAfterViewInit(): void {
    this.variantViewModeService.viewMode$
      .pipe(takeUntil(this._destroy$))
      .subscribe((viewMode) => {
        if (viewMode === ViewMode.CONFORMANCE)
          this.colorMapTab.nativeElement.click();
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
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
