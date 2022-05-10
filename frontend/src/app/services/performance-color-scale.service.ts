import { Injectable } from '@angular/core';
import { ProcessTree } from '../objects/ProcessTree';
import { PerformanceService } from './performance.service';
import { SharedDataService } from './sharedDataService/shared-data.service';
import * as d3 from 'd3';
import { BehaviorSubject } from 'rxjs';
import { COLORS_TEAL } from './variant-performance.service';

@Injectable({
  providedIn: 'root',
})
export class ModelPerformanceColorScaleService {
  public static readonly COLOR_MAPS: {
    key: string;
    name: string;
    description: string;
    longDescription: string;
  }[] = [
    {
      key: 'compareNodes',
      name: 'All Nodes',
      description:
        'Compare the performance of nodes to other nodes in the same tree.',
      longDescription: `This mode allows to compare the performance of nodes to all other nodes.
                        There is one color map for all nodes and variants, the lower/upper bound of the scale is the minimum/maximum performance value among all computed performance values.`,
    },
    {
      key: 'compareVariants',
      name: 'Variant Comparison',
      description:
        'Compare the performance of nodes to the performance of the same node in other variants.',
      longDescription: `This mode allows to compare the performance of a node to the performance of the same node in other variants.
                        Each node has it's own color map where the lower/upper bound of the scale is the minimum/maximum performance of that node among all variants.`,
    },
  ];

  public selectedColorScale = {
    mode: 'compareNodes',
    statistic: 'mean',
    performanceIndicator: 'service_time',
  };

  variantComparisonColorScale;
  nodeComparisonColorScale;

  currentColorScale = new BehaviorSubject<Map<number, any>>(undefined);

  constructor(
    private sharedDataService: SharedDataService,
    private performanceService: PerformanceService
  ) {
    performanceService.newValues.subscribe((n) => {
      if (n) {
        this.variantComparisonColorScale =
          this.computeVariantComparisonColorScale('service_time', 'mean');
        this.nodeComparisonColorScale = this.computeNodeComparisonColorScale(
          'service_time',
          'mean'
        );
        this.updateCurrentColorScale();
      }
    });
  }

  public updateCurrentColorScale(): void {
    this.currentColorScale.next(
      this.computeColorScale(
        this.selectedColorScale.mode,
        this.selectedColorScale.performanceIndicator,
        this.selectedColorScale.statistic
      )
    );
    this.variantComparisonColorScale = this.computeVariantComparisonColorScale(
      this.selectedColorScale.performanceIndicator,
      this.selectedColorScale.statistic
    );
    this.updateVariantsTooltips();
  }

  public getColorScale() {
    return this.currentColorScale.value;
  }

  public getNodeComparisonColorScale() {
    return this.nodeComparisonColorScale;
  }

  public getVariantComparisonColorScale() {
    return this.variantComparisonColorScale;
  }

  private computeColorScale(
    selection: string,
    performanceValue: string,
    statistic: string
  ) {
    switch (selection) {
      case 'compareVariants':
        return this.computeVariantComparisonColorScale(
          performanceValue,
          statistic
        );
      case 'compareNodes':
        return this.computeNodeComparisonColorScale(
          performanceValue,
          statistic
        );
    }
  }

  private computeNodeComparisonColorScale(
    performanceValue = 'service_time',
    statistic = 'mean'
  ) {
    const colorScales = new Map<number, any>();

    const values = this.getAllAllValues();
    const min = Math.min(...values);
    const max = Math.max(...values);

    let thresholds = [...Array(COLORS_TEAL.length - 1).keys()]
      .map((i) => i + 1)
      .map((i) => min + (i / COLORS_TEAL.length) * (max - min));

    const colorScale = d3
      .scaleThreshold<any, any, any>()
      .domain(thresholds)
      .range(COLORS_TEAL);

    const leafNodes = getAllNodes(this.performanceService.mergedPerformance);
    leafNodes.forEach((n) => colorScales.set(n.id, colorScale));

    return colorScales;
  }

  private computeVariantComparisonColorScale(
    performanceValue = 'service_time',
    statistic = 'mean'
  ) {
    const colorScales = new Map<number, any>();
    this.performanceService.allValues.forEach((performanceValues, treeId) => {
      const values = Array.from(performanceValues.values())
        .filter((p) => p[performanceValue])
        .map((p) => p[performanceValue][statistic]);
      const min = Math.min(...values);
      const max = Math.max(...values);

      let thresholds = [...Array(COLORS_TEAL.length - 1).keys()]
        .map((i) => i + 1)
        .map((i) => min + (i / COLORS_TEAL.length) * (max - min));

      const colorScale = d3
        .scaleThreshold<any, any, any>()
        .domain(thresholds)
        .range(COLORS_TEAL);

      colorScales.set(treeId, colorScale);
    });
    return colorScales;
  }

  public getAllAllValues() {
    let allValues = [];
    this.performanceService.allValues.forEach((pValues, treeId) => {
      const values = Array.from(pValues.values())
        .filter((p) => p[this.selectedColorScale.performanceIndicator])
        .map(
          (p) =>
            p[this.selectedColorScale.performanceIndicator][
              this.selectedColorScale.statistic
            ]
        );
      allValues.push(...values);
    });
    return allValues;
  }

  public updateVariantsTooltips() {
    let meanP = this.performanceService.mergedPerformance?.performance;
    let meanPerformance =
      meanP?.[this.selectedColorScale.performanceIndicator]?.[
        this.selectedColorScale.statistic
      ] !== undefined
        ? meanP[this.selectedColorScale.performanceIndicator][
            this.selectedColorScale.statistic
          ]
        : 0;

    const meanButton = document.getElementById('performanceButtonMean');
    if (meanButton) {
      this.performanceService.updateTooltip(
        meanButton,
        meanPerformance,
        this.selectedColorScale
      );
    }

    this.performanceService.availablePerformances.forEach((v) => {
      const performanceButton = document.getElementById(
        `performanceButton${v.number}`
      );

      let vP = this.performanceService.variantsPerformance.get(v).performance;
      let vPerformance =
        vP?.[this.selectedColorScale.performanceIndicator]?.[
          this.selectedColorScale.statistic
        ] !== undefined
          ? vP[this.selectedColorScale.performanceIndicator][
              this.selectedColorScale.statistic
            ]
          : 0;

      if (vPerformance !== undefined && performanceButton) {
        this.performanceService.updateTooltip(
          performanceButton,
          vPerformance,
          this.selectedColorScale,
          this.performanceService.fitness.get(v)
        );
      }
    });
  }
}

export function getLeafNodes(tree: ProcessTree): ProcessTree[] {
  if (tree.label && tree.children?.length === 0) {
    return [tree];
  }
  return tree.children.map((t) => getLeafNodes(t)).flat();
}

export function getAllNodes(tree: ProcessTree): ProcessTree[] {
  return [tree].concat(tree.children.map((t) => getAllNodes(t)).flat());
}

export function getAllTreeValues(
  tree: ProcessTree,
  performanceValue: string,
  statistic: string
): number[] {
  const leafNodes = getAllNodes(tree);
  return leafNodes
    .map((t) => t.performance)
    .filter((p) => p && p[performanceValue])
    .map((p) => p[performanceValue][statistic]);
}
