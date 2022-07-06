import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  deserialize,
  InvisibleSequenceGroup,
  LeafNode,
  ParallelGroup,
  SequenceGroup,
  VariantElement,
  WaitingTimeNode,
} from '../components/variant-explorer/model';
import * as d3 from 'd3';
import { SharedDataService } from './sharedDataService/shared-data.service';
import { BackendService } from './backendService/backend.service';
import { map, tap } from 'rxjs/operators';

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

  private performanceInformationLoaded: boolean = false;

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

  public selectedVariant: BehaviorSubject<VariantElement> =
    new BehaviorSubject<VariantElement>(undefined);
  public selectedVariantElement$: BehaviorSubject<VariantElement> =
    new BehaviorSubject<VariantElement>(undefined);

  get selectedVariantElement(): VariantElement {
    return this.selectedVariantElement$.value;
  }

  public serviceTimeColorMap = new BehaviorSubject<any>(undefined);
  public waitingTimeColorMap = new BehaviorSubject<any>(undefined);

  public minValues = {};
  public maxValues = {};

  setSelectedVariantElement(selectedElement: VariantElement) {
    this.selectedVariantElement$.next(selectedElement);
  }

  public variantPerformanceMode = new BehaviorSubject<boolean>(false);

  constructor(
    private sharedDataService: SharedDataService,
    private backendService: BackendService
  ) {
    this.sharedDataService.loadedEventLog$.subscribe((log) => {
      if (log !== undefined) {
        this.updateServiceTimeColorMap();
        this.updateWaitingTimeColorMap();
        this.performanceInformationLoaded = false;
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
    let values = this.sharedDataService.variants
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
    this.sharedDataService.variants.forEach((variant) => {
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

  injectWaitingTimeNodes(variants: VariantElement[]) {
    variants.forEach((v) => this.injectWaitingTimeNodesVariant(v));
  }

  injectWaitingTimeNodesVariant(variant: VariantElement) {
    if (variant instanceof SequenceGroup) {
      variant
        .asParallelGroup()
        .elements.filter((v) => !(v instanceof LeafNode))
        .forEach((e) => this.injectWaitingTimeNodesVariant(e));

      for (let i = 0; i < variant.asSequenceGroup().elements.length; i++) {
        let v = variant.asParallelGroup().elements[i];

        if (v.waitingTime?.mean !== undefined) {
          let wait = new WaitingTimeNode(v.waitingTime);
          v.waitingTime = undefined;
          variant.elements.splice(i, 0, wait);
          i += 1;
        }
      }
    }

    if (variant instanceof ParallelGroup) {
      variant
        .asParallelGroup()
        .elements.filter((v) => !(v instanceof LeafNode))
        .forEach((e) => this.injectWaitingTimeNodesVariant(e));

      for (let i = 0; i < variant.asSequenceGroup().elements.length; i++) {
        let v = variant.asParallelGroup().elements[i];
        let waitGroup = [v];
        if (v.waitingTimeStart?.mean !== undefined) {
          let wait = new WaitingTimeNode(v.waitingTimeStart);
          waitGroup.splice(0, 0, wait);
        }

        if (v.waitingTimeEnd?.mean !== undefined) {
          let wait = new WaitingTimeNode(v.waitingTimeEnd);
          waitGroup.splice(waitGroup.length, 0, wait);
        }
        variant.elements[i] = new InvisibleSequenceGroup(waitGroup);
      }
    }
  }

  addPerformanceInformationToVariants(): Observable<boolean> {
    if (this.performanceInformationLoaded) {
      return new Observable<boolean>((s) => s.next(false));
    }

    return this.backendService.getLogBasedPerformance().pipe(
      tap((res) => {
        this.sharedDataService.variants.forEach((v) => {
          v.variant = deserialize(res[v.bid]);
        });
        this.updateServiceTimeColorMap();
        this.updateWaitingTimeColorMap();
        this.injectWaitingTimeNodes(
          this.sharedDataService.variants.map((v) => v.variant)
        );
        this.performanceInformationLoaded = true;
      }),
      map((_) => true)
    );
  }
}
