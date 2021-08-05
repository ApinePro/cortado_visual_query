import { AfterViewChecked, Component, ElementRef, isDevMode, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import * as dummyBackendResponse from './dummy_backend_data.js';
import { ColorMapService } from '../../services/colorMapService/color-map.service';
import { SharedDataService } from '../../services/sharedDataService/shared-data.service';
import { BackendService } from '../../services/backendService/backend.service';

import { ActivateTooltipsService } from '../../services/activateTooltipsService/activate-tooltips.service';
import { Subject} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LeafNode, ParallelGroup, SequenceGroup, VariantElement } from './model';
import { DetailledVariantComponent } from './detailled-variant/detailled-variant.component';
import { StatsService } from 'src/app/stats.service';
import { VariantFragmentComponent } from './variant-fragment/variant-fragment.component';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-variant-explorer',
  templateUrl: './variant-explorer.component.html',
  styleUrls: ['./variant-explorer.component.css']
})
export class VariantExplorerComponent implements OnInit, AfterViewChecked {

  nVariantsInc = 10;

  constructor(private colorMapService: ColorMapService,
              private sharedDataService: SharedDataService,
              private backendService: BackendService,
              private tooltipActivationService: ActivateTooltipsService,
              private statsService: StatsService) {
  }

  colorMap: Map<string, string>;

  variants: Variant[];

  visibleVariants;

  selectedVariants = new Map<number, Set<number>>();
  explicitlyAddedVariants = new Map<number, Set<number>>();
  d3jsData;
  currentlyDisplayedProcessTree;
  usedTreeForConformanceChecking;
  alertMessage: string;
  outdatedConformanceStatistics = false;
  numberFittingTraces: number = undefined;
  numberFittingVariants: number = undefined;
  totalNumberTraces: number = undefined;
  totalNumberVariants = 5;
  calculatedAlignments = 0;
  alignmentsToBeCalculated = 0;
  correctTreeSyntax = false;
  protected unsubscribe: Subject<void> = new Subject<void>();

  @ViewChildren(VariantFragmentComponent)
  variantComponents: QueryList<VariantFragmentComponent>;

  @ViewChildren(DetailledVariantComponent)
  detailledVariantComponents: QueryList<DetailledVariantComponent>;

  @ViewChild(CdkVirtualScrollViewport) 
  viewPort: CdkVirtualScrollViewport;

  @ViewChild('variantExplorer')
  variantExplorerDiv: ElementRef<HTMLDivElement>;

  public expandVariant = {};

  ngOnInit(): void {
    // preload road traffic fine management process
    if (isDevMode() || true) {
      this.variants = [{
        count: 5,
        variant: new ParallelGroup([new SequenceGroup([new LeafNode(["a"]), new LeafNode(["b"]), new LeafNode(["c"])]), new ParallelGroup([new LeafNode(["a"]), new LeafNode(["b"])])]),
        percentage: 100,
        alignment: undefined,
        calculationInProgress: false,
        deviation: undefined,
        sub_variants: [
          { variant: [[["c", "start"], ["b", "start"], ['c', 'start']], 
                      [["c", "complete"]], 
                      [["a", "start"]], 
                      [["b", "complete"], ["c", "complete"], ["d", "start"]],
                      [['d', "complete"], ["a", "complete"]] 
                    ], count: 1, percentage: 10, 
            alignment: undefined,
            calculationInProgress: false,
            deviation: undefined 
          },
          { variant: [[["a", "start"], ['a', 'complete']], 
                      [["b", "start"]], 
                      [["b", "complete"]],
                    ], count: 1, percentage: 10, 
            alignment: undefined,
            calculationInProgress: false,
            deviation: undefined 
          },
          // { variant: [[["a", "start"]], [["b", "start"]], [["c", "start"]], [["a", "complete"]], [["e", "start"]], [["b", "complete"]], [["e", "complete"]], [["c", "complete"]]], count: 1, percentage: 10, 
          //   alignment: undefined,
          //   calculationInProgress: false,
          //   deviation: undefined  
          // },
          // { variant: [[["c", "start"]], [["b", "start"]], [["c", "complete"]], [["b", "complete"]]], count: 1, percentage: 10 , 
          //   alignment: undefined,
          //   calculationInProgress: false,
          //   deviation: undefined 
          // },
        ]
      },
      {
        count: 5,
        variant: new ParallelGroup([new LeafNode(['a']), new LeafNode(['a']), new LeafNode(['a']), new LeafNode(['a']), new LeafNode(['a']), new LeafNode(['a'])]),
        percentage: 100,
        alignment: undefined,
        calculationInProgress: false,
        deviation: undefined,
        sub_variants: [
          { variant: [[["c", "start"]], [["b", "start"]], [["c", "complete"]], [["b", "complete"]]], count: 1, percentage: 10, 
            alignment: undefined,
            calculationInProgress: false,
            deviation: undefined 
          },
          { variant: [[["c", "start"]], [["b", "start"]], [["c", "complete"]], [["b", "complete"]]], count: 1, percentage: 10, 
            alignment: undefined,
            calculationInProgress: false,
            deviation: undefined  
          },
          { variant: [[["c", "start"]], [["b", "start"]], [["c", "complete"]], [["b", "complete"]]], count: 1, percentage: 10 , 
            alignment: undefined,
            calculationInProgress: false,
            deviation: undefined 
          },
        ]
      }];

      // this.variants = dummyBackendResponse.test.variants;
      // this.variants.forEach(variant => {
      //   variant['variant'] = [new SequenceGroup(variant['events'].map(e => new LeafNode(e)))];
      // });

      this.colorMap = this.colorMapService.getColorMap(dummyBackendResponse.test.activities);
      this.colorMap.set('aaaaaaaaaa', 'red');
      this.colorMap.set('a', 'red');
      this.colorMap.set('b', 'blue');
      this.colorMap.set('c', 'green');

      this.tooltipActivationService.initialize();
    }

    this.sharedDataService.loadedEventLog$.subscribe(eventLog => {
      if (eventLog) {
        this.numberFittingVariants = undefined;
        this.numberFittingVariants = undefined;
        this.totalNumberTraces = undefined;
        this.totalNumberVariants = undefined;
        this.colorMap = this.colorMapService.getColorMap(Object.keys(this.sharedDataService.activitiesInEventLog));

        this.variants = [...this.sharedDataService.variants];
        VariantFragmentComponent.n = 0;

        this.explicitlyAddedVariants = new Map<number, Set<number>>();
        this.tooltipActivationService.initialize();
        this.selectedVariants = new Map<number, Set<number>>();
        this.calculatedAlignments = 0;
        this.expandVariant = {};

        this.calculatedAlignments = 0;
        this.alignmentsToBeCalculated = 0;

        this.statsService.reset(this.variants.length);

        let divHeight = this.variantExplorerDiv.nativeElement.clientHeight;
        
        let h = 0;
        let i = 0;
        while(h < divHeight && i < this.variants.length) {
          h += this.variants[i].variant.getHeight();
          i++;
        }
        this.visibleVariants = this.variants.slice(0, i + this.nVariantsInc);
      }
    });
    this.visibleVariants = this.variants.slice(0, this.nVariantsInc);

    this.sharedDataService.correctTreeSyntax$.subscribe(res => {
      this.correctTreeSyntax = res;
    });

    this.sharedDataService.currentDisplayedProcessTree$.subscribe(tree => {
      this.currentlyDisplayedProcessTree = tree;
      this.outdatedConformanceStatistics = !this.sharedDataService.processTreesEqual(this.usedTreeForConformanceChecking, this.currentlyDisplayedProcessTree);
    });
  }

  ngAfterViewChecked() {
    // this.drawVisible(0);
  }

  updateAlignmentsStop() {
    this.unsubscribe.next();
    // this.cancelAlignmentCalculation.complete();
    this.variants.forEach(v => {
      v.calculationInProgress = false;
      v.alignment = undefined;
      v.deviation = undefined;
    });
  }

  updateAlignments() {
    this.alignmentsToBeCalculated = this.totalNumberVariants;
    this.calculatedAlignments = 0;
    this.tooltipActivationService.close();
    this.usedTreeForConformanceChecking = this.currentlyDisplayedProcessTree;
    this.variants.forEach((v, i) => {
      v.calculationInProgress = true;
      v.deviation = false;
      let numberCalculatedVariant = 0;
      v.sub_variants.forEach((sub_v, ii) => {
        let variant = this.mapVariantToEventList(sub_v.variant);
        this.backendService.calculateAlignment(variant).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
            sub_v.calculationInProgress = false;
            sub_v.alignment = res.alignment;
            sub_v.deviation = res.deviation;

            v.deviation |= res.deviation;
            numberCalculatedVariant++;
            this.calculatedAlignments++;

            if(numberCalculatedVariant == v.sub_variants.length) {
              v.calculationInProgress = false;
              this.updateAlignmentStatistics();
            }
        });
      });
    });

    this.outdatedConformanceStatistics = false;
  }

  updateAlignmentStatistics(): void {
    let numberFittingVariants = 0;
    let numberFittingTraces = 0;
    let numberTraces = 0;
    let numberVariants = 0;

    this.variants.forEach(v => {
      if (!v.deviation) {
        numberFittingVariants++;
        numberFittingTraces += v.count;
      }
      numberTraces += v.count;
      numberVariants++;
    });
    this.totalNumberVariants = numberVariants;
    this.totalNumberTraces = numberTraces;
    this.numberFittingTraces = numberFittingTraces;
    this.numberFittingVariants = numberFittingVariants;
  }


  showAlert(msg: string): void {
    this.alertMessage = undefined;
    this.alertMessage = msg;
  }


  discover_initial_model() {
    this.tooltipActivationService.close();
    this.explicitlyAddedVariants = new Map<number, Set<number>>();
    this.selectedVariants.forEach((v, k) => {
      this.explicitlyAddedVariants.set(k, new Set(v));
    });

    console.warn(this.explicitlyAddedVariants);
    let variants = this.mapSelectionToVariants().map((v, i) => { return {value: v, i}})

    this.backendService.discoverProcessModelFromVariants(variants);
    this.clearSelection();
  }

  mapSelectionToVariants() {
    let variants: { events: string[]}[] = [];
    this.selectedVariants.forEach((selected, variantIndex) => {
      selected.forEach(subVariantIndex => variants.push(this.mapVariantIndexToVariant(variantIndex, subVariantIndex)))
    });
    return variants;
  }

  mapVariantIndexToVariant(variantIndex, subVariantIndex) {
    let v = this.variants[variantIndex].sub_variants[subVariantIndex].variant;
    return this.mapVariantToEventList(v);
  }

  mapVariantToEventList(variant) {
    return { events: variant
                        .flat()
                        .filter(v => v[1].toLowerCase() == 'complete')
                        .map(v => `${v[0]}`) };
  }

  addExplicitlyAddedVariant(variantIndex) {
    if (this.variants[variantIndex].calculationInProgress) {
      this.showAlert('Cannot explicitly add the variant - conformance statistics being calculated');
    } else if (this.outdatedConformanceStatistics) {
      this.showAlert('Cannot explicitly add the variant - outdated or no conformance statistics');
    } else if (this.variants[variantIndex].deviation) {
      this.showAlert('Cannot explicitly add the variant - variant does not fit the model');
    } else {
      this.showAlert(null);
      this.variants[variantIndex].sub_variants.forEach((sub, i) => {
        this.setExplicitlyAdded(variantIndex, i, true);
      })
    }
  }

  removeExplicitlyAddedVariant(variantIndex) {
    this.variants[variantIndex].sub_variants.forEach((sub, i) => {
      this.setExplicitlyAdded(variantIndex, i, false);
    })
  }

  addSelectedVariantsToModel() {
    this.tooltipActivationService.close();

    if (this.outdatedConformanceStatistics) {
      this.showAlert('cannot add variants - please run conformance check first');
      return;
    }

    const explicitly_added_variants = [];
    this.explicitlyAddedVariants.forEach((selectedSubVariants, variantIndex) => {
      selectedSubVariants.forEach(subVariantIndex => {
        explicitly_added_variants.push(this.mapVariantIndexToVariant(variantIndex, subVariantIndex));
      })
    });

    const variants_to_add = [];
    this.selectedVariants.forEach((selected, index) => {
      selected.forEach(ii => {
        this.variants[index].sub_variants[ii].deviation = false;
        let v = this.mapVariantIndexToVariant(index, ii);
        variants_to_add.push(v);
        this.setExplicitlyAdded(index, ii, true);
      })
    });
    this.backendService.addVariantsToModel(variants_to_add, explicitly_added_variants);
    this.clearSelection();
  }

  clearSelection() {
    let selectedVariantsVariants: [string, string][][][] = [];

    this.selectedVariants.forEach((selectedSubVariants, variantIndex) => {
      selectedSubVariants.forEach(subVariantIndex => {
        selectedVariantsVariants.push(this.variants[variantIndex].sub_variants[subVariantIndex].variant);
      })
    })

    this.detailledVariantComponents.filter(c => selectedVariantsVariants.includes(c.variant))
                            .forEach(c => c.setSelected(false));

    this.selectedVariants = new Map<number, Set<number>>();

    this.expandVariant = {};
    this.explicitlyAddedVariants.forEach((v, k) => {
      if(v.size > 0) {
        this.expandVariant[k] = true;
      }
    })
  }

  public toggleSelect(index, variant) {
    let component = this.variantComponents.find(c => c.variant === variant);

    if (this.expandVariant[index]) {
      variant.setExpanded(false);
      component.setSelected(false);
    } else {
      variant.setExpanded(true);
      component.setSelected(true);
    }

    this.expandVariant[index] = !this.expandVariant[index];
  }

  public toggleSelectSubVariant(indexVariant: number, indexSubVariant: number) {
    let variant = this.variants[indexVariant]['sub_variants'][indexSubVariant]['variant'];
    let component = this.detailledVariantComponents.find(c => c.variant === variant);
    
    if (this.isSelected(indexVariant, indexSubVariant)) {
      this.setSelected(indexVariant, indexSubVariant, false);
      component.setSelected(false);
    } else {
      this.setSelected(indexVariant, indexSubVariant, true);
      component.setSelected(true);
    }
  }

  setSelected(indexVariant, indexSubVariant, selected: boolean) {
    let selection = this.selectedVariants.get(indexVariant) || new Set<number>();
    if(selected) {
      selection.add(indexSubVariant);
    } else {
      selection.delete(indexSubVariant);
    }
    this.selectedVariants.set(indexVariant, selection);
  }

  setExplicitlyAdded(indexVariant, indexSubVariant, selected: boolean) {
    let variant = this.variants[indexVariant].sub_variants[indexSubVariant];
    if (variant.calculationInProgress) {
      this.showAlert('Cannot explicitly add the variant - conformance statistics being calculated');
    } else if (this.outdatedConformanceStatistics) {
      this.showAlert('Cannot explicitly add the variant - outdated or no conformance statistics');
    } else if (variant.deviation) {
      this.showAlert('Cannot explicitly add the variant - variant does not fit the model');
    } else {
      let selection = this.explicitlyAddedVariants.get(indexVariant) || new Set<number>();
      if(selected) {
        selection.add(indexSubVariant);
      } else {
        selection.delete(indexSubVariant);
      }
      this.explicitlyAddedVariants.set(indexVariant, selection);
    }
  }

  isSelected(indexVariant, indexSubVariant) {
    return this.selectedVariants.get(indexVariant)?.has(indexSubVariant) || false;
  }

  isExplicitlyAdded(index, indexSubVariant) {
    return this.explicitlyAddedVariants.get(index)?.has(indexSubVariant) || false;
  }

  isVariantExplicitlyAdded(index) {
    let l1 = this.explicitlyAddedVariants.get(index)?.size || 0;
    let l2 = this.variants[index].sub_variants.length;
    return l1 === l2;
  }

  isSomeSelected() {
    let someSelected = false;
    this.selectedVariants.forEach(v => someSelected ||= v.size > 0);
    return someSelected;
  }

  onScroll(event) {
    let scrollTop = event.target.scrollTop;
    let scrollHeight = event.target.scrollHeight;
    this.updateVisible(scrollTop, scrollHeight);
  }

  updateVisible(scrollTop, scrollHeight) {
    let h = this.variantExplorerDiv.nativeElement.clientHeight;

    if(scrollHeight - (h + scrollTop) <= 500) {
      this.visibleVariants = this.variants.slice(0, this.visibleVariants.length + this.nVariantsInc);
    }
  }

  isComplexVariant(variant: VariantElement) {
    if(variant instanceof ParallelGroup) {
      return true;
    } else if(variant instanceof SequenceGroup) {
      for(let e of variant.asSequenceGroup().elements) {
        let complex = this.isComplexVariant(e)
        if(complex) {
          return true;
        }
      }
      return false;
    } else {
      return false;
    }
  }
}

export class Variant {
  count: number;
  variant: VariantElement;
  percentage: number;
  calculationInProgress: boolean | undefined;
  alignment: any | undefined;
  deviation: any | undefined;
  sub_variants: {
    count: number
    variant: [string, string][][],
    percentage: number,
    calculationInProgress: boolean | undefined,
    alignment: any | undefined,
    deviation: any | undefined
  }[] | undefined
}