import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import { BackendService } from './../../services/backendService/backend.service';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';
import { LayoutChangeDirective } from 'src/app/directives/layout-change.directive';
import { DropzoneConfig } from '../drop-zone/drop-zone.component';
import {
  deserialize,
  LeafNode,
  Variant,
  VariantElement,
} from '../variant-explorer/model';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer.directive';
import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Options } from '@angular-slider/ngx-slider';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-variant-miner',
  templateUrl: './variant-miner.component.html',
  styleUrls: ['./variant-miner.component.scss'],
  animations: [
    trigger('collapse', [
      transition(':enter', [
        style({ opacity: '0', width: '0px', overflow: 'hidden' }),
        animate('250ms ease-in', style({ width: '*' })),
      ]),
      transition(':leave', [
        animate('250ms ease-in', style({ opacity: '0.4', width: '0px' })),
      ]),
    ]),
  ],
})
export class VariantMinerComponent
  extends LayoutChangeDirective
  implements OnInit, AfterViewInit
{
  constructor(
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    private backendService: BackendService,
    private sharedDataService: SharedDataService,
    private colorMapService: ColorMapService,
    elRef: ElementRef,
    renderer: Renderer2
  ) {
    super(elRef.nativeElement, renderer);
  }

  FrequentMiningStrategy = FrequentMiningStrategy;
  VariantSortKey = VariantSortKey;
  currentSortKey: VariantSortKey;

  showControls: boolean = true;

  kLow: number = 0;
  kHigh: number = 5;
  kOptions: Options = {
    floor: 0,
    ceil: 15,
    draggableRange: true,
    showTicksValues: true,
    tickStep: 1,
    tickValueStep: 2,
  };

  supLow: number = 0;
  supHigh: number = 500;
  supOptions: Options = {
    floor: 0,
    ceil: 1000,
    draggableRange: true,
    showTicksValues: true,
    tickStep: 100,
    tickValueStep: 200,
  };

  indexLow: number = 0;
  indexHigh: number = 5;
  indexOptions: Options = {
    floor: 0,
    ceil: 15,
    draggableRange: true,
    showTicksValues: true,
    tickStep: 1,
    tickValueStep: 2,
  };

  crossConfLow: number = 0;
  crossConfHigh: number = 1;
  crossConfOptions: Options = {
    floor: 0,
    ceil: 1,
    draggableRange: true,
    showTicksValues: true,
    tickStep: 0.1,
    tickValueStep: 0.2,
    step: 0.01,
  };

  spConfLow: number = 0;
  spConfHigh: number = 1;
  spConfOptions: Options = {
    floor: 0,
    ceil: 1,
    draggableRange: true,
    showTicksValues: true,
    tickStep: 0.1,
    tickValueStep: 0.2,
    step: 0.01,
  };

  cpConfLow: number = 0;
  cpConfHigh: number = 1;
  cpConfOptions: Options = {
    floor: 0,
    ceil: 1,
    draggableRange: true,
    showTicksValues: true,
    tickStep: 0.1,
    tickValueStep: 0.2,
    step: 0.01,
  };

  variantMinerOutOfFocus: boolean = false;

  ascending: boolean = false;
  minsup: number = 0;

  variantMinerResults: any;
  colorMap;

  showOnlyClosed: boolean = false;
  showOnlyMaximal: boolean = false;

  variantPatterns: Array<SubvariantPattern> = new Array<SubvariantPattern>();
  displayedVariantsPatterns: Array<SubvariantPattern> =
    new Array<SubvariantPattern>();

  dropZoneConfig: any;
  variantMinerConfigInput: FormGroup;

  ngOnInit(): void {
    this.dropZoneConfig = new DropzoneConfig(
      '.xes',
      'false',
      'false',
      '<large> Import <strong>Event Log</strong> .xes file</large>'
    );

    this.variantMinerConfigInput = new FormGroup({
      k: new FormControl('', {
        updateOn: 'change',
      }),

      min_sup: new FormControl('', {
        updateOn: 'change',
      }),

      frequent_mining_strat: new FormControl(
        this.FrequentMiningStrategy.TraceTransaction,
        {
          updateOn: 'change',
        }
      ),
    });
  }

  onSubmit() {
    console.log('SUBMIT', this.variantMinerConfigInput.value);

    const form_values = this.variantMinerConfigInput.value;

    const config = new MiningConfig(
      form_values.k,
      form_values.min_sup,
      form_values.frequent_mining_strat
    );

    this.backendService.frequentSubtreeMining(config);

    this.minsup = form_values.min_sup;
  }

  handleFilterChange(event) {
    console.log('CHANGE ENDED!');
    console.log(event);
    console.log(this.showOnlyMaximal);

    this.displayedVariantsPatterns = this.variantPatterns.filter((vp) => {
      if (
        vp.k >= this.kLow &&
        vp.k <= this.kHigh &&
        ((this.showOnlyMaximal && vp.maximal) || !this.showOnlyMaximal) &&
        ((this.showOnlyClosed && vp.closed) || !this.showOnlyClosed) &&
        vp.support >= this.supLow &&
        vp.support <= this.supHigh &&
        vp.child_parent_confidence >= this.cpConfLow &&
        vp.child_parent_confidence <= this.cpConfHigh &&
        vp.cross_support_confidence >= this.crossConfLow &&
        vp.cross_support_confidence <= this.crossConfHigh &&
        vp.subpattern_confidence >= this.spConfLow &&
        vp.subpattern_confidence <= this.spConfHigh
      ) {
        return true;
      }
    });

    this.sortDisplayedVariants(this.currentSortKey);
  }

  ngAfterViewInit(): void {
    this.colorMapService.colorMap$.subscribe((cMap) => {
      this.colorMap = cMap;
    });

    this.sharedDataService.frequentMiningResults$.subscribe((res) => {
      if (res) {
        this.variantPatterns = new Array<SubvariantPattern>();

        res.forEach((p, i) => {
          if (p.valid) {
            const variant: VariantElement = deserialize(p.obj);
            variant.setExpanded(true);

            this.variantPatterns.push(
              new SubvariantPattern(
                i,
                p.k,
                variant,
                p.sup,
                p.child_parent_confidence,
                p.subpattern_confidence,
                p.cross_support_confidence,
                p.maximal,
                p.valid,
                p.closed
              )
            );
          }
        });

        this.showOnlyMaximal = false;
        this.showOnlyClosed = false;
        this.displayedVariantsPatterns = this.variantPatterns;

        let maxK: number = 0;
        let maxSup: number = 0;

        this.variantPatterns.forEach((p, i) => {
          if (p.k > maxK) {
            maxK = p.k;
          }

          if (p.support > maxSup) {
            maxSup = p.support;
          }
        });

        this.kOptions = {
          floor: 3,
          ceil: maxK,
          draggableRange: true,
          showTicksValues: true,
          tickStep: 2,
          tickValueStep: 2,
        };

        this.kLow = 3;
        this.kHigh = maxK;

        this.supLow = this.minsup;
        this.supHigh = maxSup;
        this.supOptions = {
          floor: this.minsup,
          ceil: maxSup,
          draggableRange: true,
          showTicksValues: true,
          tickStep: 100,
          tickValueStep: 200,
        };

        this.indexLow = 0;
        this.indexHigh = this.variantPatterns.length;
        this.indexOptions = {
          floor: 0,
          ceil: this.variantPatterns.length,
          draggableRange: true,
          showTicksValues: true,
          tickStep: 10,
          tickValueStep: 100,
        };

        this.crossConfLow = 0;
        this.crossConfHigh = 1;
        this.crossConfOptions = {
          floor: 0,
          ceil: 1,
          draggableRange: true,
          showTicksValues: true,
          tickStep: 0.1,
          tickValueStep: 0.2,
          step: 0.01,
        };

        this.spConfLow = 0;
        this.spConfHigh = 1;
        this.spConfOptions = {
          floor: 0,
          ceil: 1,
          draggableRange: true,
          showTicksValues: true,
          tickStep: 0.1,
          tickValueStep: 0.2,
          step: 0.01,
        };

        this.cpConfLow = 0;
        this.cpConfHigh = 1;
        this.cpConfOptions = {
          floor: 0,
          ceil: 1,
          draggableRange: true,
          showTicksValues: true,
          tickStep: 0.1,
          tickValueStep: 0.2,
          step: 0.01,
        };
      }
    });
  }

  sort(key: VariantSortKey) {
    if (this.currentSortKey == key) {
      this.ascending = !this.ascending;
    } else {
      this.ascending = false;
    }

    this.sortDisplayedVariants(key);

    this.currentSortKey = key;
  }

  sortDisplayedVariants(key: VariantSortKey) {
    this.displayedVariantsPatterns.sort(
      (a: SubvariantPattern, b: SubvariantPattern) => {
        if (a[key] < b[key]) {
          return this.ascending ? -1 : 1;
        } else if (a[key] > b[key]) {
          return this.ascending ? 1 : -1;
        } else {
          return 0;
        }
      }
    );
  }

  computeActivityColor = (
    self: VariantDrawerDirective,
    element: VariantElement,
    variant: Variant
  ) => {
    let color;

    if (element instanceof LeafNode) {
      color = this.colorMap.get(element.asLeafNode().activity[0]);
    } else {
      color = '#d3d3d3';
    }

    return color;
  };

  handleResponsiveChange(
    left: number,
    top: number,
    width: number,
    height: number
  ): void {}

  handleVisibilityChange(visibility: boolean): void {}

  handleZIndexChange(
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void {}

  toggleBlur(event) {
    this.variantMinerOutOfFocus = event;
  }
}

export namespace VariantMinerComponent {
  export const componentName = 'VariantMinerComponent';
}

export class MiningConfig {
  k: number;
  min_sup: number;
  strat: number;

  constructor(k, min_sup, strat) {
    this.k = k;
    this.min_sup = min_sup;
    this.strat = strat;
  }

  serialize() {
    return { k: this.k, min_sup: this.min_sup, strat: this.strat };
  }
}

export enum FrequentMiningStrategy {
  TraceTransaction = 1,
  VariantTransaction = 2,
  TraceOccurence = 3,
  VariantOccurence = 4,
}

export enum VariantSortKey {
  k = 'k',
  index = 'index',
  support = 'support',
  child_parent_confidence = 'child_parent_confidence',
  subpattern_confidence = 'subpattern_confidence',
  cross_support_confidence = 'cross_support_confidence',
  maximal = 'maximal',
  closed = 'closed',
}

export enum VariantFilterKey {
  k = 'k',
  support = 'support',
  index = 'index',
  child_parent_confidence = 'child_parent_confidence',
  subpattern_confidence = 'subpattern_confidence',
  cross_support_confidence = 'cross_support_confidence',
  maximal = 'maximal',
  closed = 'closed',
}

export class SubvariantPattern {
  index: number;
  k: number;
  variant: VariantElement;
  support: number;
  child_parent_confidence: number;
  subpattern_confidence: number;
  cross_support_confidence: number;
  maximal: boolean;
  valid: boolean;
  closed: boolean;

  constructor(
    index: number,
    k: number,
    variant: VariantElement,
    support: number,
    child_parent_confidence: number,
    subpattern_confidence: number,
    cross_support_confidence: number,
    maximal: boolean,
    valid: boolean,
    closed: boolean
  ) {
    this.index = index;
    this.k = k;
    this.variant = variant;
    this.support = support;
    this.child_parent_confidence = child_parent_confidence;
    this.subpattern_confidence = subpattern_confidence;
    this.cross_support_confidence = cross_support_confidence;
    this.maximal = maximal;
    this.valid = valid;
    this.closed = closed;
  }
}
