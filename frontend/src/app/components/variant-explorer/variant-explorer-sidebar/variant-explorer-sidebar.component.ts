import { Component, Input, OnInit } from '@angular/core';
import { ViewMode } from 'src/app/objects/ViewMode';
import { VariantPerformanceService } from 'src/app/services/variant-performance.service';
import { VariantViewModeService } from 'src/app/services/variantViewModeService/variant-view-mode.service';

@Component({
  selector: 'app-variant-explorer-sidebar',
  templateUrl: './variant-explorer-sidebar.component.html',
  styleUrls: ['./variant-explorer-sidebar.component.css'],
})
export class VariantExplorerSidebarComponent implements OnInit {
  @Input()
  public sidebarHeight: number = 0;

  public VM = ViewMode;

  constructor(
    public variantViewModeService: VariantViewModeService,
    private variantPerformanceService: VariantPerformanceService
  ) {}

  ngOnInit(): void {
    return;
  }

  public setViewModeClicked(viewMode: ViewMode) {
    if (
      viewMode === ViewMode.PERFORMANCE &&
      !this.variantPerformanceService.performanceInformationLoaded
    )
      this.variantPerformanceService
        .addPerformanceInformationToVariants()
        .subscribe();
    else this.variantViewModeService.viewMode = viewMode;
  }
}
