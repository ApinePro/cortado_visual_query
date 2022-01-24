import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  HumanizeDuration,
  HumanizeDurationLanguage,
} from 'humanize-duration-ts';
import { ModelPerformanceColorScaleService } from 'src/app/services/performance-color-scale.service';
import { PerformanceService } from 'src/app/services/performance.service';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import { PerformanceStats, Variant } from '../../variant-explorer/model';
import { TreePerformance } from '../../../objects/ProcessTree';

@Component({
  selector: 'app-node-selection-performance',
  templateUrl: './node-selection-performance.component.html',
  styleUrls: ['./node-selection-performance.component.scss'],
})
export class NodeSelectionPerformanceComponent implements OnInit {
  treeSelection: string = undefined;
  humanizeDuration: HumanizeDuration;

  meanValues: TreePerformance;
  serviceTimeValues: Map<Variant, PerformanceStats> = new Map();
  waitingTimeValues: Map<Variant, PerformanceStats> = new Map();
  idleTimeValues: Map<Variant, PerformanceStats> = new Map();
  cycleTimeValues: Map<Variant, PerformanceStats> = new Map();

  public variants: Set<Variant>;

  public variantIndices = new Map<Variant, number>();

  constructor(
    public performanceService: PerformanceService,
    public performanceColorScaleService: ModelPerformanceColorScaleService,
    public sharedDataService: SharedDataService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    const durationLang = new HumanizeDurationLanguage();
    this.humanizeDuration = new HumanizeDuration(durationLang);
  }

  ngOnInit(): void {
    this.variants = this.performanceService.availablePerformances;

    this.performanceService.treeSelection.subscribe((tree) => {
      this.treeSelection = tree?.toString();
      const meanValues = this.performanceService.allValuesMean.get(tree?.id);
      if (tree && meanValues) {
        this.meanValues = this.performanceService.allValuesMean.get(tree.id);

        Array.from(this.performanceService.allValues.get(tree.id).entries())
          .map(
            ([v, p]) =>
              <[number, TreePerformance]>[
                this.sharedDataService.variants.indexOf(v),
                p,
              ]
          )
          .filter(([vIdx, p]) => p.service_time)
          .sort((a, b) => a[0] - b[0])
          .forEach(([vIdx, p]) => {
            const v = this.sharedDataService.variants[vIdx];
            this.variantIndices.set(v, vIdx + 1);
            this.serviceTimeValues.set(
              v,
              this.performanceService.allValues.get(tree.id).get(v).service_time
            );
            this.waitingTimeValues.set(
              v,
              this.performanceService.allValues.get(tree.id).get(v).waiting_time
            );
            this.cycleTimeValues.set(
              v,
              this.performanceService.allValues.get(tree.id).get(v).cycle_time
            );
            this.idleTimeValues.set(
              v,
              this.performanceService.allValues.get(tree.id).get(v).idle_time
            );
          });
      }

      this.changeDetectorRef.markForCheck();
    });
  }
}

export class PerformanceValues {
  variantName: string | undefined;
  performance: PerformanceStats;
}
