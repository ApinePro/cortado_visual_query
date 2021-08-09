import { Component, ElementRef, isDevMode, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import * as dummyBackendResponse from './dummy_backend_data.js';
import { ColorMapService } from '../../services/colorMapService/color-map.service';
import { SharedDataService } from '../../services/sharedDataService/shared-data.service';
import { BackendService } from '../../services/backendService/backend.service';

import { ActivateTooltipsService } from '../../services/activateTooltipsService/activate-tooltips.service';
import { Subject} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { deserialize, ParallelGroup, SequenceGroup, VariantElement } from './model';
import { VariantFragmentComponent } from './variant-fragment/variant-fragment.component';

@Component({
  selector: 'app-variant-explorer',
  templateUrl: './variant-explorer.component.html',
  styleUrls: ['./variant-explorer.component.css']
})
export class VariantExplorerComponent implements OnInit {

  private readonly nVariantsInc = 20;

  constructor(private colorMapService: ColorMapService,
              private sharedDataService: SharedDataService,
              private backendService: BackendService,
              private tooltipActivationService: ActivateTooltipsService) {
  }

  public variants: Variant[] = [];
  public visibleVariants: Variant[] = [];

  public colorMap: Map<string, string>;

  public currentlyDisplayedProcessTree;
  public usedTreeForConformanceChecking;
  public alertMessage: string;
  public outdatedConformanceStatistics = false;

  protected unsubscribe: Subject<void> = new Subject<void>();
  
  public correctTreeSyntax = false;

  public selectedVariants: number[] = [];
  public explicitlyAddedVariants: number[] = [];

  public numberFittingTraces: number = undefined;
  public numberFittingVariants: number = undefined;
  public totalNumberTraces: number = undefined;
  public totalNumberVariants = 5;
  public alignmentsToBeCalculated = 0;

  public alignmentCalculationInProgress = false;

  @ViewChildren(VariantFragmentComponent)
  variantComponents: QueryList<VariantFragmentComponent>;

  @ViewChild('variantExplorer', { static: true })
  variantExplorerDiv: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    // preload road traffic fine management process
    if (isDevMode() || true) {
      this.variants = dummyBackendResponse.test.variants;
      this.variants.forEach(v => {
        v.variant = deserialize(v.variant);
      })
      this.colorMap = this.colorMapService.getColorMap(Object.keys(dummyBackendResponse.test.activities));
      this.tooltipActivationService.initialize();
      this.initializeVisibleVariants();

      let total = this.variants.map(v => v.count).reduce((a, b) => a + b);
      this.variants.forEach(v => {
        v.percentage = Number.parseFloat((v.count / total * 100).toFixed(2));
      });

      this.numberFittingVariants = undefined;
      this.totalNumberTraces = total;
      this.totalNumberVariants = this.variants.length;
    }

    this.sharedDataService.loadedEventLog$.subscribe(eventLog => {
      if (eventLog) {
        this.eventLogChanged(eventLog);
      }
    });

    this.sharedDataService.correctTreeSyntax$.subscribe(res => {
      this.correctTreeSyntax = res;
    });

    this.sharedDataService.currentDisplayedProcessTree$.subscribe(tree => {
      this.currentlyDisplayedProcessTree = tree;
      this.outdatedConformanceStatistics = !this.sharedDataService.processTreesEqual(this.usedTreeForConformanceChecking, this.currentlyDisplayedProcessTree);
    });
  }


  private eventLogChanged(eventLog) {
    this.colorMap = this.colorMapService.getColorMap(Object.keys(this.sharedDataService.activitiesInEventLog));

    this.variants = this.sharedDataService.variants;
    this.initializeVisibleVariants();

    this.tooltipActivationService.initialize();

    this.alignmentsToBeCalculated = 0;

    this.explicitlyAddedVariants = [];
    this.selectedVariants = [];

    this.numberFittingVariants = undefined;
    this.numberFittingTraces = undefined;

    this.totalNumberTraces = this.variants.map(v => v.count).reduce((a, b) => a + b);
    this.totalNumberVariants = this.variants.length;
  }

  initializeVisibleVariants() {
    let divHeight = this.variantExplorerDiv.nativeElement.clientHeight;
    let h = 0;
    let i = 0;
    while(h < divHeight && i < this.variants.length) {
      h += this.variants[i].variant.getHeight();
      i++;
    }
    this.visibleVariants = this.variants.slice(0, i + this.nVariantsInc);
  }

  updateAlignmentsStop() {
    this.unsubscribe.next();
    this.variants.forEach(v => {
      v.calculationInProgress = false;
      v.alignment = undefined;
      v.deviation = undefined;
    });
  }

  updateAlignments() {
    this.alignmentsToBeCalculated = this.totalNumberVariants;
    let calculatedAlignments = 0;
    this.tooltipActivationService.close();
    this.alignmentCalculationInProgress = true;

    this.variants.forEach(v => {
      v.calculationInProgress = true;
      v.deviation = undefined;

      this.backendService.calculateAlignmentsCVariant(v.variant).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
        v.calculationInProgress = false;
        v.alignment = res.alignment;
        v.deviation = res.deviation;

        v.deviation = res.deviation;
        calculatedAlignments++;
        this.updateAlignmentStatistics();

        if(calculatedAlignments == this.variants.length) {
          this.alignmentCalculationInProgress = false;
          this.usedTreeForConformanceChecking = this.currentlyDisplayedProcessTree;
        }
      }, _ => {
        this.alignmentCalculationInProgress = false;
        this.updateAlignmentsStop();
      });
    });

    this.outdatedConformanceStatistics = false;
  }

  updateAlignmentStatistics(): void {
    let numberFittingVariants = 0;
    let numberFittingTraces = 0;

    this.variants.forEach(v => {
      if (v.deviation !== undefined && !v.deviation) {
        numberFittingVariants++;
        numberFittingTraces += v.count;
      }
    });
    this.numberFittingTraces = numberFittingTraces;
    this.numberFittingVariants = numberFittingVariants;
  }


  showAlert(msg: string): void {
    this.alertMessage = undefined;
    this.alertMessage = msg;
  }


  discover_initial_model() {
    this.tooltipActivationService.close();
    this.explicitlyAddedVariants = [...this.selectedVariants];
    console.warn(this.explicitlyAddedVariants);

    let variants = this.selectedVariants.map(i => this.variants[i].variant);

    this.backendService.discoverProcessModelFromConcurrencyVariants(variants);
    this.clearSelection();
  }


  genSimpleVariants(variant: VariantElement) {
    if(variant instanceof SequenceGroup) {
      return variant.elements;
    } else if(variant instanceof ParallelGroup) {
      
    } else {
      return [variant.asLeafNode().activity];
    }
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
      this.explicitlyAddedVariants.push(variantIndex);
    }
  }

  removeExplicitlyAddedVariant(variantIndex) {
    let i = this.explicitlyAddedVariants.indexOf(variantIndex);
    this.explicitlyAddedVariants.splice(i, 1);
  }

  addSelectedVariantsToModel() {
    this.tooltipActivationService.close();

    if (this.outdatedConformanceStatistics) {
      this.showAlert('cannot add variants - please run conformance check first');
      return;
    }

    let explicitlyAddedVariants = this.explicitlyAddedVariants.map(i => this.variants[i].variant);

    const variantsToAdd: VariantElement[] = [];
    this.selectedVariants.forEach(i => {
      variantsToAdd.push(this.variants[i].variant);
    });

    this.backendService.addConcurrencyVariantsToProcessModel(variantsToAdd, explicitlyAddedVariants).subscribe(res => {
      this.selectedVariants.forEach(i => {
        this.variants[i].deviation = false;
        this.explicitlyAddedVariants.push(i);
      });
      this.clearSelection();
    });
  }

  clearSelection() {
    this.selectedVariants = [];
  }

  public toggleSelect(index, variant) {
    let component = this.variantComponents.find(c => c.variant === variant);

    if (this.selectedVariants.includes(index)) {
      variant.setExpanded(false);
      component.setSelected(false);

      let i = this.selectedVariants.indexOf(index);
      this.selectedVariants.splice(i, 1);
    } else {
      variant.setExpanded(true);
      component.setSelected(true);
      this.selectedVariants.push(index);
    }
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