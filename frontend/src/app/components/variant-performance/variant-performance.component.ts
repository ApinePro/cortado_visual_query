import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LayoutChangeDirective } from 'src/app/directives/layout-change/layout-change.directive';
import { VariantPerformanceService } from 'src/app/services/variant-performance.service';

@Component({
  selector: 'app-variant-performance',
  templateUrl: './variant-performance.component.html',
  styleUrls: ['./variant-performance.component.scss'],
})
export class VariantPerformanceComponent
  extends LayoutChangeDirective
  implements OnInit, OnDestroy
{
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

  public performanceStats: any;
  public title: string;

  public colorScale;

  private _destroy$ = new Subject();

  ngOnInit(): void {
    this.variantPerformanceService.performanceStatsForSelectedVariantElement$
      .pipe(takeUntil(this._destroy$))
      .subscribe((data) => {
        if (data == undefined) {
          this.performanceStats = null;
          return;
        }
        this.performanceStats = data[0];
        const isServiceTime: boolean = data[1];
        this.title = 'Service Time';
        if (!isServiceTime) {
          this.title = 'Waiting Time';
        }
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }
}

export namespace VariantPerformanceComponent {
  export const componentName = 'VariantPerformanceComponent';
}
