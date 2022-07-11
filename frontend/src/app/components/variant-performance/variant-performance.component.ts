import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { VariantElement } from 'src/app/objects/Variants/variant_element';
import { VariantPerformanceService } from 'src/app/services/variant-performance.service';

@Component({
  selector: 'app-variant-performance',
  templateUrl: './variant-performance.component.html',
  styleUrls: ['./variant-performance.component.scss'],
})
export class VariantPerformanceComponent implements OnInit {
  constructor(
    public variantPerformanceService: VariantPerformanceService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

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
