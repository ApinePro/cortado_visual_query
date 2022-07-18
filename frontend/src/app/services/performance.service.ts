import { Injectable } from '@angular/core';
import { Variant } from '../components/variant-explorer/model';
import { ProcessTree, TreePerformance } from '../objects/ProcessTree';
import { BackendService } from './backendService/backend.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ActivateTooltipsService } from './activateTooltipsService/activate-tooltips.service';
import { HumanizeDurationPipe } from '../pipes/humanize-duration.pipe';
import { ProcessTreeService } from './processTreeService/process-tree.service';
import { VariantService } from './variantService/variant.service';

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
    private variantService: VariantService,
    private backendService: BackendService,
    private tooltipService: ActivateTooltipsService,
    private processTreeService: ProcessTreeService
  ) {
    this.currentPt = processTreeService.currentDisplayedProcessTree;

    this.variantService.variants$.subscribe((_variants) => {
      this.clear();
    });
    processTreeService.currentDisplayedProcessTree$.subscribe((pt) => {
      if (pt) {
        this.treeSelection.next(pt);
      } else {
        this.clear();
        this.treeSelection.next(undefined);
        this.currentPt = undefined;
        return;
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

    const variantBIDs: number[] = variants.map((v) => v.bid);
    variants
      .filter((v) => !this.availablePerformances.has(v))
      .forEach((v) => this.calculationInProgress.add(v));
    this.latestRequest = this.backendService
      .getTreePerformance(
        variantBIDs,
        removeVariants?.map((v) => v.bid)
      )
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

          this.processTreeService.set_currentDisplayedProcessTree_with_Cache(
            performance.merged_performance_tree
          );

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
              `performanceButton${v.bid}`
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
          variants.forEach((v) => this.calculationInProgress.clear());
        }
      );
  }

  public unselectPerformance() {
    this.processTreeService.currentDisplayedProcessTree = this.clearProcessTree(
      this.processTreeService.currentDisplayedProcessTree
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
      tooltipText = `${tooltipText}<hr class="performance-tooltip-hr"><i class="bi bi-exclamation-triangle-fill text-warning"> Unfitting traces: possibly unreliable model performance values!</i><br>Fitness: ${fitness.toFixed(
        2
      )}`;
    }

    tooltipText = `${tooltipText}<hr class="performance-tooltip-hr">click to visualize performance of this variant on model`;

    button.setAttribute('title', tooltipText);
    this.tooltipService.destroyTooltip(button);
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
      this.processTreeService.set_currentDisplayedProcessTree_with_Cache(
        this.variantsPerformance.get(variant)
      );
    } else {
      console.error(`No performance values available: ${variant}`);
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
      // TODO Change this to allow Performance Tree Cleanup
      //this.sharedDataService.currentDisplayedProcessTree =
      //  this.clearProcessTree(this.currentPt);
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
