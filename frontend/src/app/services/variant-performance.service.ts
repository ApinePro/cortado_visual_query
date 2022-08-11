import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { map, finalize, concatMap, tap } from 'rxjs/operators';
import * as d3 from 'd3';
import { LogService } from './logService/log.service';
import { VariantService } from './variantService/variant.service';
import { injectWaitingTimeNodes } from 'src/app/objects/Variants/variant_element';

import {
  VariantElement,
  LeafNode,
  ParallelGroup,
  SequenceGroup,
  WaitingTimeNode,
  deserialize,
} from '../objects/Variants/variant_element';
import { BackendService } from './backendService/backend.service';
import { setParent } from '../objects/Variants/infix_selection';
import { ViewMode } from '../objects/ViewMode';
import { VariantViewModeService } from './variantViewModeService/variant-view-mode.service';

// https://observablehq.com/@philippkoytek/celonis-data-visualization-colors
export const COLORS_CYAN = [
  '#3ad7f7',
  '#15bfdf',
  '#03a6c6',
  '#028eac',
  '#027694',
  '#025f7c',
  '#024965',
  '#01344f',
  '#012138',
];
// export const COLORS_CYAN = ["#3ad7f7", "#0ab0d0", "#0289a7", "#026481", "#02415c", "#012138"];

export const COLORS_PINK = [
  '#ffeaff',
  '#ffcaf5',
  '#ffabde',
  '#fd8ac8',
  '#fc63b0',
  '#f4378f',
  '#d62578',
  '#b91260',
  '#9b0048',
];
// export const COLORS_PINK = ["#ffeaff", "#ffb7e7", "#fd82c3", "#f64096", "#ca1d6e", "#9b0048"];

// export const COLORS_TEAL = ["#00e8c0", "#05c3ab", "#06a093", "#067e79", "#035e5e", "#024042"];
export const COLORS_TEAL = [
  '#00e8c0',
  '#04d1b3',
  '#06baa5',
  '#06a496',
  '#068f87',
  '#067a76',
  '#046665',
  '#025254',
  '#024042',
];

@Injectable({
  providedIn: 'root',
})
export class VariantPerformanceService {
  private _serviceTimeStatistic = 'mean';
  private _waitingTimeStatistic = 'mean';

  public performanceInformationLoaded: boolean = false;
  public performanceUpdateIsInProgress: boolean = false;
  public performanceUpdateProgress: number = 0;
  private results = new Map<string, any>();

  get serviceTimeStatistic() {
    return this._serviceTimeStatistic;
  }

  set serviceTimeStatistic(statistic) {
    this._serviceTimeStatistic = statistic;
    this.updateServiceTimeColorMap();
  }

  get waitingTimeStatistic() {
    return this._waitingTimeStatistic;
  }

  set waitingTimeStatistic(statistic) {
    this._waitingTimeStatistic = statistic;
    this.updateWaitingTimeColorMap();
  }

  public performanceStatsForSelectedVariantElement$: BehaviorSubject<
    [any, boolean]
  > = new BehaviorSubject<[any, boolean]>(undefined);

  get performanceStatsForSelectedVariantElement(): [any, boolean] {
    return this.performanceStatsForSelectedVariantElement$.value;
  }

  public serviceTimeColorMap = new BehaviorSubject<any>(undefined);
  public waitingTimeColorMap = new BehaviorSubject<any>(undefined);

  public minValues = {};
  public maxValues = {};

  setPerformanceStatsSelectedVariantElement(
    performanceStats: any,
    isServiceTime: boolean
  ) {
    this.performanceStatsForSelectedVariantElement$.next([
      performanceStats,
      isServiceTime,
    ]);
  }

  constructor(
    private logService: LogService,
    private variantService: VariantService,
    private backendService: BackendService,
    private variantViewModeService: VariantViewModeService
  ) {
    this.logService.loadedEventLog$.subscribe((log) => {
      if (log !== undefined) {
        this.updateServiceTimeColorMap();
        this.updateWaitingTimeColorMap();
        this.performanceInformationLoaded = false;
        this.performanceUpdateProgress = 0;
        this.results = new Map<string, any>();
      }
    });

    this.updateServiceTimeColorMap();
    this.updateWaitingTimeColorMap();
  }

  private updateServiceTimeColorMap() {
    this.serviceTimeColorMap.next(
      this.computeVariantPerformanceColorMap(
        COLORS_CYAN,
        'serviceTime',
        this.serviceTimeStatistic
      )
    );
    return this.serviceTimeColorMap;
  }

  getServiceTimeColorMapAll() {
    return this.getVariantsComparisonColorMap(
      COLORS_CYAN,
      'serviceTime',
      this.serviceTimeStatistic
    );
  }

  private updateWaitingTimeColorMap() {
    this.waitingTimeColorMap.next(
      this.computeVariantPerformanceColorMap(
        COLORS_PINK,
        'waitingTime',
        this.waitingTimeStatistic
      )
    );
    return this.waitingTimeColorMap;
  }

  getWaitingTimeColorMapAll() {
    return this.getVariantsComparisonColorMap(
      COLORS_PINK,
      'waitingTime',
      this.waitingTimeStatistic
    );
  }

  private getVariantsComparisonColorMap(
    colors,
    performanceIndicator,
    statistic
  ) {
    let values = this.variantService.variants
      .map((v) => v.variant)
      .map((v) => v[performanceIndicator][statistic]);
    let min = Math.min(...values);
    let max = Math.max(...values);

    let thresholds = [...Array(colors.length - 1).keys()]
      .map((i) => i + 1)
      .map((i) => min + (i / colors.length) * (max - min));

    let colorScale = d3
      .scaleThreshold<any, any, any>()
      .domain(thresholds)
      .range(colors);

    return colorScale;
  }

  private computeVariantPerformanceColorMap(
    colors,
    performanceIndicator,
    value
  ) {
    let values = this.getAllValues(performanceIndicator, value).filter(
      (v) => v !== undefined
    );

    let min = Math.min(...values);
    let max = Math.max(...values);

    this.minValues[performanceIndicator] = min;
    this.maxValues[performanceIndicator] = max;

    let thresholds = [...Array(colors.length - 1).keys()]
      .map((i) => i + 1)
      .map((i) => min + (i / colors.length) * (max - min));

    let colorScale = d3
      .scaleThreshold<any, any, any>()
      .domain(thresholds)
      .range(colors);

    return colorScale;
  }

  getAllValues(performanceIndicator, value): number[] {
    let values = [];
    this.variantService.variants.forEach((variant) => {
      let vElement = variant.variant;
      let vs = this.getAllValuesElement(vElement, performanceIndicator, value);
      values.push(...vs);
    });
    return values;
  }

  getAllValuesElement(
    variantElement: VariantElement,
    performanceIndicator,
    value
  ): number[] {
    let values = [];
    if (
      variantElement instanceof LeafNode ||
      variantElement instanceof WaitingTimeNode
    ) {
      if (variantElement[performanceIndicator]) {
        values.push(variantElement[performanceIndicator][value]);
      }
    }
    if (
      variantElement instanceof ParallelGroup ||
      variantElement instanceof SequenceGroup
    ) {
      variantElement
        .asParallelGroup()
        .elements.map((el) =>
          this.getAllValuesElement(el, performanceIndicator, value)
        )
        .forEach((v) => values.push(...v));
    }
    return values;
  }

  addVariantPerformanceResults(chunkResult) {
    for (const [k, v] of Object.entries(chunkResult)) {
      this.results.set(k, v);
    }
  }

  addPerformanceInformationToVariants(): Observable<any> {
    this.performanceUpdateIsInProgress = true;
    let chunks = [];
    const nVariants = this.variantService.variants.length;
    for (let i = 0; i < nVariants; i += 100) {
      chunks.push([i, Math.min(i + 99, nVariants - 1)]);
    }

    return from(chunks).pipe(
      concatMap((chunk) =>
        this.backendService.getLogBasedPerformance(chunk[0], chunk[1])
      ),
      tap((res) => {
        this.addVariantPerformanceResults(res);
        this.performanceUpdateProgress = this.results.size / nVariants;
      }),
      finalize(() => {
        this.variantService.variants.forEach((v) => {
          if (!v.userDefined) {
            v.variant = deserialize(this.results.get(v.bid.toString()));
            setParent(v.variant);
          }
        });
        this.updateServiceTimeColorMap();
        this.updateWaitingTimeColorMap();
        injectWaitingTimeNodes(
          this.variantService.variants.map((v) => v.variant)
        );

        setTimeout(() => {
          this.performanceInformationLoaded = true;
          this.performanceUpdateIsInProgress = false;
          this.variantViewModeService.viewMode = ViewMode.PERFORMANCE;
        }, 1000);
      })
    );
  }
}
