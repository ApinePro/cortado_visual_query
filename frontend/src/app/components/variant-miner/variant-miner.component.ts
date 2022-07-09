import { InfixType } from 'src/app/components/variant-explorer/model';
import { ProcessTreeService } from 'src/app/services/processTreeService/process-tree.service';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import { BackendService } from './../../services/backendService/backend.service';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
  ViewChild,
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
import { AlignmentType, ConformanceCheckingService } from 'src/app/services/conformanceChecking/conformance-checking.service';
import { FrequentMiningAlgorithm, FrequentMiningCMStrategy, FrequentMiningStrategy, MiningConfig, SubvariantPattern, VariantSortKey } from './variant-miner-types';
import { ProcessTree } from 'src/app/objects/ProcessTree';

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
    private conformanceCheckingService: ConformanceCheckingService,
    private processTreeService : ProcessTreeService, 
    elRef: ElementRef,
    renderer: Renderer2
  ) {
    super(elRef.nativeElement, renderer);
  }

  @ViewChild('variantMiner', { static: false })
  variantMinerDiv: ElementRef<HTMLDivElement>;

  FrequentMiningStrategy = FrequentMiningStrategy;
  FrequentMiningAlgorithm = FrequentMiningAlgorithm;
  FrequentMiningCMStrategy = FrequentMiningCMStrategy;
  VariantSortKey = VariantSortKey;
  currentSortKey: VariantSortKey;

  processTree : ProcessTree = null; 
  conformanceCheckedTree : ProcessTree = null; 

  conformanceTimeout = 30; 
  math = Math;

  maxSup : number;
  maxK : number;
  nClosed : number;
  nValid : number;
  nMaximal : number;

  currentConfig : MiningConfig = null; 

  showControls: boolean = true;
  relSup = 25;
  supportSliderOptions: Options = {
    floor: 0,
    ceil: 100,
    step: 0.01,
    tickStep: 25,
    showSelectionBar: true,
    showTicks : true,
    translate: (value: number): string => {
      return +value.toFixed(1) + '%';
    }
  };

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

  totalTraces : number;
  totalVariants : number;

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

    this.subscribeForConformanceCheckingResults();

    const rel_sup = new FormControl(1000, {
      updateOn: 'change',
    });

    const min_sup = new FormControl(1000, {
      updateOn: 'change',
    });

    const frequent_mining_strat = new FormControl(
      this.FrequentMiningStrategy.TraceTransaction,
      {
        updateOn: 'change',
      }
    );


    this.variantMinerConfigInput = new FormGroup({
      k: new FormControl(20, {
        updateOn: 'change',
      }),

      min_sup,
      rel_sup,
      frequent_mining_strat,

      artifical_start : new FormControl(false, {
        updateOn: 'change'
      }),

      fold_loop : new FormControl(false, {
        updateOn: 'change'
      }),
      loop: new FormControl(2, {
        updateOn: 'change',
      }),

      frequent_mining_algo: new FormControl(this.FrequentMiningAlgorithm.ValidTreeMiner, {
          updateOn: 'change',
      }),

      cm_tree_strategy: new FormControl(this.FrequentMiningCMStrategy.ClosedMaximal, {
        updateOn: 'change',
    }),
    });




    rel_sup.valueChanges.subscribe((relSup) => {

      const min_sup_update = this.variantMinerConfigInput.value.frequent_mining_strat === FrequentMiningStrategy.TraceTransaction ||
      this.variantMinerConfigInput.value.frequent_mining_strat ===
      FrequentMiningStrategy.TraceOccurence
      ? Math.round((relSup / 100) * this.totalTraces)
      : Math.round((relSup / 100) * this.totalVariants)

      min_sup.setValue(min_sup_update)

    })


    frequent_mining_strat.valueChanges.subscribe((strat) => {


      if(strat == FrequentMiningStrategy.VariantTransaction || strat == FrequentMiningStrategy.TraceTransaction){
        this.supportSliderOptions = {
          floor: 0,
          ceil: 100,
          step: 0.01,
          tickStep: 25,
          showSelectionBar: true,
          showTicks : true,
          translate: (value: number): string => {
            return +value.toFixed(1) + '%';
          }
        };


      } else {

        this.supportSliderOptions = {
          floor: 0,
          ceil: 150,
          step: 0.01,
          tickStep: 25,
          showSelectionBar: true,
          showTicks : true,
          translate: (value: number): string => {
            return +value.toFixed(1) + '%';
          }
        };

      }

    })

    this.sharedDataService.variants$.subscribe((variants) => {
      this.totalTraces = variants.map((variant) => {return variant.count}).reduce((a : number, b : number) => a + b)
      this.totalVariants = variants.length;

      console.log('Total Traces', this.totalTraces)
      console.log('Total Variants', this.totalVariants)

    })
  }

  onSubmit() {
    console.log('SUBMIT', this.variantMinerConfigInput.value);

    const form_values = this.variantMinerConfigInput.value;

    let loop = 0;
    if (form_values.fold_loop){
      loop = form_values.loop
    }

    this.currentConfig = new MiningConfig(
      form_values.k,
      form_values.min_sup,
      form_values.frequent_mining_strat,
      loop,
      form_values.frequent_mining_algo,
      form_values.artifical_start,
    );

    console.log(this.currentConfig)
    this.backendService.frequentSubtreeMining(this.currentConfig);

    this.minsup = form_values.min_sup;
  }


  handleFilterChange(event) {
    this.displayedVariantsPatterns = this.variantPatterns.filter((vp) => {
      if (
        vp.k >= this.kLow &&
        vp.k <= this.kHigh &&
        ((this.showOnlyMaximal && vp.maximal) || !this.showOnlyMaximal) &&
        ((this.showOnlyClosed && vp.closed) || !this.showOnlyClosed) &&
        vp.support >= this.supLow &&
        vp.support <= this.supHigh &&
        vp.child_parent_confidence >= this.cpConfLow &&
        vp.child_parent_confidence <= this.cpConfHigh
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

    this.sharedDataService.loadedEventLog$.subscribe((log) => {
      console.log('Log Changed', log)
      this.variantPatterns = [];
      this.displayedVariantsPatterns = [];
    })

    this.processTreeService.currentDisplayedProcessTree$.subscribe((tree) => {
      this.processTree = tree

      const treeHasChanged = !this.sharedDataService.processTreesEqual(
        this.conformanceCheckedTree,
        this.processTree
      );

      if (treeHasChanged) {
        this.variantPatterns.forEach((v) => {
          v.isConformanceOutdated = true;
        });
      }})


    this.backendService.getConfiguration().subscribe((config) => {
      this.conformanceTimeout =
        config.timeoutCVariantAlignmentComputation + 30;
    });

    this.sharedDataService.frequentMiningResults$.subscribe((res) => {
      if (res) {
        this.variantPatterns = new Array<SubvariantPattern>();

        res.forEach((p, i) => {
          if (p.valid) {
            const variant: VariantElement = deserialize(p.obj);
            variant.setExpanded(true);

            const pattern = new SubvariantPattern(
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

            pattern.isConformanceOutdated = true;
            pattern.isTimeouted = false;

            this.variantPatterns.push(
              pattern
            );
          }
        });

        this.maxSup = Math.max(...this.variantPatterns.map((v) => v.support))
        this.maxK =  Math.max(...this.variantPatterns.map((v) => v.k))
        this.nClosed =this.variantPatterns.filter((v) => v.closed).length
        this.nValid =this.variantPatterns.filter((v) => v.valid).length
        this.nMaximal =  this.variantPatterns.filter((v) => v.maximal).length

        this.variantPatterns.map((v) => v.support)
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

      if (element.activity.length > 1) {
        color = '#d3d3d3'; // lightgray
      }

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

  handleVisibilityChange(visibility: boolean): void {


  }

  handleZIndexChange(
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void {}

  toggleBlur(event) {
    this.variantMinerOutOfFocus = event;
  }


  computeAlignments(){
    console.log('Requested Alignment!')
    this.displayedVariantsPatterns.forEach((pattern) => this.updateConformanceForVariant(pattern, this.conformanceTimeout))

    this.conformanceCheckedTree = this.processTree; 
  }

  updateConformanceForVariant(pattern: SubvariantPattern, timeout: number): void {

    this.processTreeService.currentDisplayedProcessTree !== null
    //variant.calculationInProgress = true;
    //variant.deviation = undefined;

    const resubscribe = this.conformanceCheckingService.calculateConformance(
      (pattern.index).toLocaleString(),
      InfixType.PROPER_INFIX,
      this.processTreeService.currentDisplayedProcessTree,
      pattern.variant.serialize(this.currentConfig.loop),
      timeout,
      AlignmentType.PatternAlignment,
    );

    if (resubscribe) {
      this.subscribeForConformanceCheckingResults();
    }
  }


  subscribeForConformanceCheckingResults(): void {
    this.conformanceCheckingService.patternResults.subscribe(
      (res) => {
        
        console.log(res)
        
        const pattern = this.variantPatterns.find((p) => p.index.toLocaleString() == (res.id));
        console.log(pattern)
        pattern.calculationInProgress = false;
        pattern.isTimeouted = res.isTimeout;
        pattern.isConformanceOutdated = res.isTimeout; 

        if (!res.isTimeout) {
          pattern.deviation = res.deviation;
        }
      },
      (_) => {
        this.variantPatterns.forEach((p) => {
          p.calculationInProgress = false;
          p.alignment = undefined;
          p.deviation = undefined;
        });
      }
    );
  }
  
}

export namespace VariantMinerComponent {
  export const componentName = 'VariantMinerComponent';
}

