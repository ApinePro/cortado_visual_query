import { ProcessTreeService } from 'src/app/services/processTreeService/process-tree.service';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import {
  HumanizeDuration,
  HumanizeDurationLanguage,
} from 'humanize-duration-ts';
import { ProcessTree, TreePerformance } from 'src/app/objects/ProcessTree';
import { ModelPerformanceColorScaleService } from 'src/app/services/performance-color-scale.service';
import { PerformanceService } from 'src/app/services/performance.service';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import { PerformanceStats } from '../variant-explorer/model';

@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.scss'],
})
export class ModelPerformanceComponent implements OnInit {
  duration: HumanizeDuration;

  colorValues = [];

  performanceValues = [];

  treeSelection: string = undefined;
  selectionPerformances: [string, PerformanceStats][] = undefined;

  constructor(
    public performanceService: PerformanceService,
    private processTreeService: ProcessTreeService,
    public performanceColorScaleService: ModelPerformanceColorScaleService,
    private changeDetectionRef: ChangeDetectorRef
  ) {
    const durationLang = new HumanizeDurationLanguage();
    this.duration = new HumanizeDuration(durationLang);
  }

  ngOnInit(): void {
    this.processTreeService.currentDisplayedProcessTree$.subscribe((tree) => {
      this.performanceValues = [];
      if (tree && tree.performance) {
        this.nodePerformance(tree);
        this.changeDetectionRef.markForCheck();
      } else if (tree === undefined) {
        this.selectionPerformances = [];
        this.treeSelection = undefined;
        this.changeDetectionRef.markForCheck();
        return;
      }
    });

    this.performanceService.treeSelection.subscribe((tree) => {
      if (
        tree === undefined ||
        this.performanceService.availablePerformances.size === 0
      ) {
        this.selectionPerformances = [];
        this.treeSelection = undefined;
        this.changeDetectionRef.markForCheck();
        return;
      }

      this.selectionPerformances = [];
      this.treeSelection = tree?.toString();

      if (tree && this.performanceService.allValuesMean.has(tree.id)) {
        if (this.performanceService.allValuesMean.get(tree.id).service_time) {
          this.selectionPerformances.push([
            'Mean',
            this.performanceService.allValuesMean.get(tree.id).service_time,
          ]);
        }
        Array.from(this.performanceService.allValues.get(tree.id).entries())
          .map(([v, p]) => <[number, TreePerformance]>[v.bid, p])
          .filter(([v, p]) => p.service_time)
          .sort((a, b) => (a[0] = b[0]))
          .forEach(([v, p]) => {
            if (p.service_time) {
              this.selectionPerformances.push([
                `Variant No. ${v}`,
                p.service_time,
              ]);
            }
          });
      }
      this.changeDetectionRef.markForCheck();
    });
  }

  private nodePerformance(treeNode: ProcessTree): void {
    if (treeNode.performance) {
      this.performanceValues.push([treeNode.toString(), treeNode.performance]);
      treeNode.children.forEach((n) => this.nodePerformance(n));
    }
  }
}
