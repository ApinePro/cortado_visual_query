
import { Component, ElementRef, Inject, isDevMode, OnInit, QueryList, ViewChild, ViewChildren, Renderer2 } from '@angular/core';
import {ComponentContainer} from 'golden-layout';
import {ColorMapService} from '../../services/colorMapService/color-map.service';
import {SharedDataService} from '../../services/sharedDataService/shared-data.service';
import {BackendService} from '../../services/backendService/backend.service';

import {ActivateTooltipsService} from '../../services/activateTooltipsService/activate-tooltips.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {deserialize, ParallelGroup, SequenceGroup, VariantElement} from './model';
import {VariantFragmentComponent} from './variant-fragment/variant-fragment.component';
import {LayoutChangeDirective} from '../../directives/layout-change.directive';



@Component({
  selector: 'app-variant-explorer',
  templateUrl: './variant-explorer.component.html',
  styleUrls: ['./variant-explorer.component.scss']
})
export class VariantExplorerComponent extends LayoutChangeDirective implements OnInit {

  constructor(private colorMapService: ColorMapService,
              private sharedDataService: SharedDataService,
              private backendService: BackendService,
              private tooltipActivationService: ActivateTooltipsService,
              @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken) private container: ComponentContainer,
              elRef: ElementRef,
              renderer : Renderer2
              ){
    super(elRef.nativeElement, renderer);
    const state = this.container.initialState;
  }

  private readonly nVariantsInc = 50;

  public variants: Variant[] = [];
  public visibleVariants: Variant[] = [];
  public dummyVariants: Variant[] = [];
  public invisibleVariantsHeight = 50;

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

  public alignmentCalculationInProgress = false;

  @ViewChildren(VariantFragmentComponent)
  variantComponents: QueryList<VariantFragmentComponent>;

  @ViewChild('variantExplorer', {static: true})
  variantExplorerDiv: ElementRef<HTMLDivElement>;

  public visibleVariantsHeight = 1000;

  ngOnInit(): void {
    // preload road traffic fine management process
      this.variants = this.sharedDataService.variants;

      this.variants.forEach(v => {
        v.variant = deserialize(v.variant);
      });

      this.colorMap = this.colorMapService.getColorMap(Object.keys(this.sharedDataService.activitiesInEventLog));
      this.tooltipActivationService.initialize();
      this.initializeVisibleVariants();

      const total = this.variants.map(v => v.count).reduce((a, b) => a + b);
      this.variants.forEach(v => {
        v.percentage = Number.parseFloat((v.count / total * 100).toFixed(2));
      });

      this.numberFittingVariants = undefined;
      this.totalNumberTraces = total;
      this.totalNumberVariants = this.variants.length;


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
      this.outdatedConformanceStatistics = !this.sharedDataService.processTreesEqual(this.usedTreeForConformanceChecking,
        this.currentlyDisplayedProcessTree);
    });
  }


  private eventLogChanged(eventLog): void {
    this.colorMap = this.colorMapService.getColorMap(Object.keys(this.sharedDataService.activitiesInEventLog));

    this.variants = this.sharedDataService.variants;
    this.initializeVisibleVariants();

    this.tooltipActivationService.initialize();

    this.explicitlyAddedVariants = [];
    this.selectedVariants = [];

    this.numberFittingVariants = undefined;
    this.numberFittingTraces = undefined;

    this.totalNumberTraces = this.variants.map(v => v.count).reduce((a, b) => a + b);
    this.totalNumberVariants = this.variants.length;
  }

  initializeVisibleVariants(): void {
    const divHeight = this.variantExplorerDiv.nativeElement.clientHeight;
    let h = 0;
    let i = 0;
    while (h < divHeight && i < this.variants.length) {
      h += this.variants[i].variant.getHeight();
      i++;
    }
    this.visibleVariants = this.variants.slice(0, i + this.nVariantsInc);
    this.dummyVariants = this.variants.slice(this.visibleVariants.length, this.variants.length + 1);
    this.invisibleVariantsHeight = this.dummyVariants.map(v => v.variant.getHeight())
      .reduce((a, b) => a + b, 0) / this.dummyVariants.length;
    this.visibleVariantsHeight = this.visibleVariants.map(v => v.variant.getHeight())
      .reduce((a, b) => a + b, 0);
  }

  updateAlignmentsStop(): void {
    this.unsubscribe.next();
    this.variants.forEach(v => {
      v.calculationInProgress = false;
      v.alignment = undefined;
      v.deviation = undefined;
    });
  }

  updateAlignments(): void {
    const alignmentsToBeCalculated = this.totalNumberVariants - this.explicitlyAddedVariants.length;
    let calculatedAlignments = 0;
    this.tooltipActivationService.close();
    this.alignmentCalculationInProgress = true;

    this.explicitlyAddedVariants.map(idx => this.variants[idx]).forEach(v => {
      v.deviation = false;
      v.calculationInProgress = false;
    });
    this.updateAlignmentStatistics();
    if (alignmentsToBeCalculated === 0) {
      this.alignmentCalculationInProgress = false;
      this.usedTreeForConformanceChecking = this.currentlyDisplayedProcessTree;
    }

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
        if (res.deviation) {
          const indexNonFittingVariant = this.variants.findIndex(element => v === element);
          this.explicitlyAddedVariants = this.explicitlyAddedVariants.filter(i => i !== indexNonFittingVariant);
        }

        if (calculatedAlignments === alignmentsToBeCalculated) {
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


  discoverInitialModel(): void {
    this.tooltipActivationService.close();
    this.explicitlyAddedVariants = [...this.selectedVariants];
    console.warn(this.explicitlyAddedVariants);

    const variants = this.selectedVariants.map(i => this.variants[i].variant);

    this.backendService.discoverProcessModelFromConcurrencyVariants(variants);
    this.clearSelection();
  }


  genSimpleVariants(variant: VariantElement): any {
    if (variant instanceof SequenceGroup) {
      return variant.elements;
    } else if (variant instanceof ParallelGroup) {

    } else {
      return [variant.asLeafNode().activity];
    }
  }

  mapVariantIndexToVariant(variantIndex, subVariantIndex): any {
    const v = this.variants[variantIndex].sub_variants[subVariantIndex].variant;
    return this.mapVariantToEventList(v);
  }

  mapVariantToEventList(variant): any {
    return {
      events: variant
        .flat()
        .filter(v => v[1].toLowerCase() === 'complete')
        .map(v => `${v[0]}`)
    };
  }

  addExplicitlyAddedVariant(variantIndex): void {
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

  removeExplicitlyAddedVariant(variantIndex): void {
    const i = this.explicitlyAddedVariants.indexOf(variantIndex);
    this.explicitlyAddedVariants.splice(i, 1);
  }

  addSelectedVariantsToModel(): void {
    this.tooltipActivationService.close();

    if (this.outdatedConformanceStatistics) {
      this.showAlert('cannot add variants - please run conformance check first');
      return;
    }

    const explicitlyAddedVariants = this.explicitlyAddedVariants.map(i => this.variants[i].variant);

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

  clearSelection(): void {
    this.selectedVariants = [];
    this.variantComponents.forEach(c => c.setSelected(false));
  }

  public toggleSelect(index, variant): void {
    const component = this.variantComponents.find(c => c.variant === variant);

    if (this.selectedVariants.includes(index)) {
      variant.setExpanded(false);
      component.setSelected(false);

      const i = this.selectedVariants.indexOf(index);
      this.selectedVariants.splice(i, 1);
    } else {
      variant.setExpanded(true);
      component.setSelected(true);
      this.selectedVariants.push(index);
    }
  }

  onScroll(event): void {
    const scrollTop = event.target.scrollTop;
    const scrollHeight = event.target.scrollHeight;
    this.updateVisible(scrollTop);
  }

  updateVisible(scrollTop): void {
    const h = this.variantExplorerDiv.nativeElement.clientHeight;
    if (this.visibleVariantsHeight - (h + scrollTop) <= 50) {

      while (this.visibleVariantsHeight < (h + scrollTop) && this.visibleVariants.length < this.variants.length) {
        const v = this.dummyVariants.pop();
        this.visibleVariantsHeight += v.variant.getHeight();
        this.visibleVariants.push(v);
      }
      this.invisibleVariantsHeight = this.dummyVariants.map(v => v.variant.getHeight())
        .reduce((a, b) => a + b, 0) / this.dummyVariants.length;
    }
  }

  isComplexVariant(variant: VariantElement) {
    if (variant instanceof ParallelGroup) {
      return true;
    } else if (variant instanceof SequenceGroup) {
      for (const e of variant.asSequenceGroup().elements) {
        const complex = this.isComplexVariant(e);
        if (complex) {
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
  }[] | undefined;
}

export namespace VariantExplorerComponent{
  export const componentName = "VariantExplorerComponent";
}
