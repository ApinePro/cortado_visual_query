import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

  public performanceStats: any;
  public title: string;

  public colorScale;

  ngOnInit(): void {
    this.variantPerformanceService.performanceStatsForSelectedVariantElement$.subscribe(
      (data) => {
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
      }
    );
  }
}
