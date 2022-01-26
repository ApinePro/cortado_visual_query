import { Injectable } from '@angular/core';
import { Variant, VariantElement } from '../components/variant-explorer/model';
import { ProcessTree, TreePerformance } from '../objects/ProcessTree';
import { BackendService } from './backendService/backend.service';
import { SharedDataService } from './sharedDataService/shared-data.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ActivateTooltipsService } from './activateTooltipsService/activate-tooltips.service';
import { HumanizeDurationPipe } from '../pipes/humanize-duration.pipe';

@Injectable({
  providedIn: 'root',
})
export class PerformanceService {
  mergedPerformance: ProcessTree;
  // key is variant, value is process tree
  variantsPerformance: Map<Variant, ProcessTree> = new Map<
    Variant,
    ProcessTree
  >();
  availablePerformances: Set<Variant> = new Set<Variant>();
  // key is id of node, value is map with performance stats for each variant
  allValues: Map<number, Map<Variant, TreePerformance>> = new Map<
    number,
    Map<Variant, TreePerformance>
  >();
  allValuesMean: Map<number, TreePerformance> = new Map<
    number,
    TreePerformance
  >();
  // colorScale for each tree node;
  activeVariant: Variant = undefined;
  treeSelection: BehaviorSubject<ProcessTree> =
    new BehaviorSubject<ProcessTree>(undefined);
  newValues: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  calculationInProgress = new Set<Variant>();
  latestRequest: Subscription;
  fitness = new Map<Variant, number>();
  private currentPt: ProcessTree;

  constructor(
    private sharedDataService: SharedDataService,
    private backendService: BackendService,
    private tooltipService: ActivateTooltipsService
  ) {
    this.currentPt = sharedDataService.currentDisplayedProcessTree;

    sharedDataService.variants$.subscribe((_variants) => {
      this.clear();
    });
    sharedDataService.currentDisplayedProcessTree$.subscribe((pt) => {
      if (pt) {
        this.treeSelection.next(pt);
      }

      if (
        !this.currentPt?.equals(pt) ||
        (this.currentPt.equals(pt) &&
          !pt.performance &&
          this.currentPt.performance)
      ) {
        this.clear();
        this.currentPt = pt;
      }
    });
  }

  public removeAll() {
    this.updatePerformance([], Array.from(this.availablePerformances));
  }

  public updatePerformance(
    variants: Variant[],
    removeVariants?: Variant[]
  ): void {
    this.latestRequest?.unsubscribe();

    if (removeVariants !== undefined) {
      removeVariants.forEach((v) => this.deletePerformance(v));
      this.calculationInProgress.clear();
    }

    // Add previously computed variants again to get updated merged values
    // performance values should be cached in backend
    const available = new Set(this.variantsPerformance.keys());
    available.forEach((idx) => {
      if (!variants.includes(idx)) {
        variants.push(idx);
      }
    });

    this.calculationInProgress.forEach((v) => {
      if (!variants.includes(v)) {
        variants.push(v);
      }
    });

    const variantElements: VariantElement[] = variants.map((v) => v.variant);
    variants
      .filter((v) => !this.availablePerformances.has(v))
      .forEach((v) => this.calculationInProgress.add(v));
    this.latestRequest = this.backendService
      .getTreePerformance(variantElements, removeVariants)
      .subscribe(
        (performance) => {
          this.mergedPerformance = ProcessTree.fromObj(
            performance.merged_performance_tree
          );

          this.allValues.clear();
          this.setVariantsPerformance(
            variants,
            performance.variants_tree_performance
          );
          this.allValuesMean.clear();
          this.setMeanPerformanceMap(this.mergedPerformance);

          variants.forEach((v, i) => {
            this.fitness.set(v, performance.fitness_values[i]);
          });

          variants.forEach((v) => this.availablePerformances.add(v));
          this.newValues.next(true);

          this.sharedDataService.currentDisplayedProcessTree =
            performance.merged_performance_tree;

          variants.forEach((v) => this.calculationInProgress.delete(v));

          const meanPerformance =
            this.mergedPerformance?.performance?.service_time?.mean;
          const meanButton = document.getElementById('performanceButtonMean');
          if (meanButton) {
            this.updateTooltip(meanButton, meanPerformance);
          }

          if (variants.length === 0) {
            this.clear();
            return;
          }

          variants.forEach((v) => {
            // TODO: use currently selected performanceIndicator and statistic
            const performanceButton = document.getElementById(
              `performanceButton${v.number}`
            );
            const vPerformance =
              this.variantsPerformance.get(v)?.performance?.service_time?.mean;
            if (vPerformance && performanceButton) {
              this.updateTooltip(
                performanceButton,
                vPerformance,
                { performanceIndicator: 'Service Time', statistic: 'mean' },
                this.fitness.get(v)
              );
            }
          });
        },
        (error) => {
          console.log(error);
          variants.forEach((v) => this.calculationInProgress.clear());
        }
      );
  }

  public unselectPerformance() {
    this.sharedDataService.currentDisplayedProcessTree = this.clearProcessTree(
      this.sharedDataService.currentDisplayedProcessTree
    );
    this.activeVariant = null;
  }

  public updateTooltip(
    button: HTMLElement,
    perf: number,
    selectedColorScale?,
    fitness?: number
  ): void {
    let tooltipText = HumanizeDurationPipe.apply(perf * 1000, { round: true });
    if (selectedColorScale) {
      tooltipText = `${selectedColorScale.performanceIndicator} (${selectedColorScale.statistic}): ${tooltipText}`;
    }

    if (fitness !== undefined && fitness < 1) {
      tooltipText = `${tooltipText}<hr class="performance-tooltip-hr">Unfitting traces: possibly unreliable model performance values!<br>Fitness: ${fitness.toFixed(
        2
      )}`;
    }

    tooltipText = `${tooltipText}<hr class="performance-tooltip-hr">Click to visualize performance of this variant on model.`;

    button.setAttribute('title', tooltipText);
    this.tooltipService.initializeTooltip(button);
  }

  public setVariantsPerformance(
    variants: Variant[],
    performanceTrees: ProcessTree[]
  ): void {
    for (let i = 0; i < variants.length; i++) {
      this.variantsPerformance.set(variants[i], performanceTrees[i]);
    }

    variants.forEach((variant, i) => {
      const tree = performanceTrees[i];
      this.collectPerformance(tree, variant, this.allValues);
    });
  }

  // Stores performance values for each tree node in the performances map under the given variantIdx
  collectPerformance(
    vp: ProcessTree,
    variant: Variant,
    performances: Map<number, Map<Variant, TreePerformance>>
  ): Map<number, Map<Variant, TreePerformance>> {
    if (!performances.has(vp.id)) {
      performances.set(vp.id, new Map<Variant, TreePerformance>());
    }
    performances.get(vp.id).set(variant, vp.performance);

    for (const child of vp.children) {
      this.collectPerformance(child, variant, performances);
    }
    return performances;
  }

  public setShownVariantPerformance(variant: Variant): void {
    this.activeVariant = variant;
    if (this.variantsPerformance.has(variant)) {
      this.sharedDataService.currentDisplayedProcessTree =
        this.variantsPerformance.get(variant);
    } else {
      console.error(`No performance values available: ${Variant}`);
    }
  }

  private clear(): void {
    this.mergedPerformance = undefined;
    this.variantsPerformance.clear();
    this.availablePerformances.clear();
    this.allValues.clear();
    this.allValuesMean.clear();
    this.activeVariant = undefined;
    this.calculationInProgress.clear();
    this.treeSelection.next(undefined);

    if (this.currentPt) {
      this.sharedDataService.currentDisplayedProcessTree =
        this.clearProcessTree(this.currentPt);
    }
  }

  private clearProcessTree(tree: ProcessTree) {
    let copy: any = {};
    Object.assign(copy, tree);
    copy.performance = undefined;
    copy.children = copy.children.map((t) => this.clearProcessTree(t));
    return copy;
  }

  private deletePerformance(variant: Variant) {
    if (this.activeVariant == variant) {
      this.activeVariant = null;
    }
    this.availablePerformances.delete(variant);
    this.variantsPerformance.delete(variant);
    this.allValues.forEach((v) => v.delete(variant));
  }

  private setMeanPerformanceMap(tree: ProcessTree): void {
    this.allValuesMean.set(tree.id, tree.performance);
    tree.children.forEach((node) => this.setMeanPerformanceMap(node));
  }
}
