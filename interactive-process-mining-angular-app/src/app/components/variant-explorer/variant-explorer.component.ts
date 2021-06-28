import { Component, isDevMode, OnInit, QueryList, ViewChildren} from '@angular/core';
import * as dummyBackendResponse from './dummy_backend_data.js';
import {ColorMapService} from '../../services/colorMapService/color-map.service';
import {SharedDataService} from '../../services/sharedDataService/shared-data.service';
import {BackendService} from '../../services/backendService/backend.service';

import {ActivateTooltipsService} from '../../services/activateTooltipsService/activate-tooltips.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import { LeafNode, ParallelGroup, SequenceGroup, VariantElement } from './model';
import { VariantComponent } from './variant/variant.component';

@Component({
  selector: 'app-variant-explorer',
  templateUrl: './variant-explorer.component.html',
  styleUrls: ['./variant-explorer.component.css']
})
export class VariantExplorerComponent implements OnInit {

  constructor(private colorMapService: ColorMapService,
              private sharedDataService: SharedDataService,
              private backendService: BackendService,
              private tooltipActivationService: ActivateTooltipsService) {
  }

  colorMap: Map<string, string>;
  variants: any[];
  selectedVariants: any[] = [];
  explicitlyAddedVariants: number[] = [];
  d3jsData;
  currentlyDisplayedProcessTree;
  usedTreeForConformanceChecking;
  alertMessage: string;
  outdatedConformanceStatistics = false;
  numberFittingTraces: number = undefined;
  numberFittingVariants: number = undefined;
  totalNumberTraces: number = undefined;
  totalNumberVariants = 231;
  calculatedAlignments = 0;
  alignmentsToBeCalculated = 0;
  correctTreeSyntax = false;
  protected unsubscribe: Subject<void> = new Subject<void>();

  @ViewChildren(VariantComponent)
  variantsComponents: QueryList<VariantComponent>;

  ngOnInit(): void {
    // preload road traffic fine management process
    if (isDevMode() || true) {
      // console.log("devMode active -> load dummy data");
      // console.log(dummyBackendResponse.test);

      this.variants = [{
        count: 5,
        variant: [new ParallelGroup([new SequenceGroup([new LeafNode("aaaaaaaaaa"), new LeafNode("b"), new LeafNode("c")]), new ParallelGroup([new LeafNode("aaaaaaaaaa"), new LeafNode("b")])])],
        percentage: 100
      }];

      // this.variants = dummyBackendResponse.test.variants;
      // this.variants.forEach(variant => {
      //   variant['variant'] = [new SequenceGroup(variant['events'].map(e => new LeafNode(e)))];
      // });

      this.colorMap = this.colorMapService.getColorMap(dummyBackendResponse.test.activities);
      this.colorMap.set('aaaaaaaaaa', 'red');
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
        this.variants = this.sharedDataService.variants;
        this.variants.forEach(variant => {
          variant['variant'] = variant['variant'].map(v => this.deserialize(v));
        });

        this.explicitlyAddedVariants = [];
        this.tooltipActivationService.initialize();
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

  deserialize(obj: any): VariantElement {
    if('follows' in obj) {
      return new SequenceGroup(obj['follows'].map((e: any) => this.deserialize(e)))
    } else if('parallel' in obj) {
      return new ParallelGroup(obj['parallel'].map((e: any) => this.deserialize(e)))
    } else {
      return new LeafNode(obj['leaf']);
    }
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
    this.variants.forEach(v => {
      v.calculationInProgress = true;
      this.backendService.calculateAlignment(v).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
        // console.log(res);
        v.calculationInProgress = false;
        v.alignment = res.alignment;
        v.deviation = res.deviation;
        // remove explicitlyAddedDeviation if they do not fit anymore
        if (res.deviation) {
          const idx_explicitly_added_variant_with_deviation = this.variants.findIndex(element => v === element);
          this.explicitlyAddedVariants = this.explicitlyAddedVariants.filter(i => i !== idx_explicitly_added_variant_with_deviation);
        }
        this.updateAlignmentStatistics();
        this.calculatedAlignments++;
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
    this.explicitlyAddedVariants = [];
    this.selectedVariants.forEach(v => {
      this.explicitlyAddedVariants.push(v);
    });
    console.warn(this.explicitlyAddedVariants);
    let variants = this.selectedVariants.map(i => {
      return {value: this.variants[i], i};
    })
    this.backendService.discoverProcessModelFromVariants(variants);
    this.clearSelection();
  }

  removeExplicitlyAddedVariant(i: number) {
    this.explicitlyAddedVariants = this.explicitlyAddedVariants.filter(v => {
      return v !== i;
    });
  }

  addExplicitlyAddedVariant(i: number) {
    if (this.variants[i].calculationInProgress) {
      this.showAlert('Cannot explicitly add the variant - conformance statistics being calculated');
    } else if (this.outdatedConformanceStatistics) {
      this.showAlert('Cannot explicitly add the variant - outdated or no conformance statistics');
    } else if (this.variants[i].deviation) {
      this.showAlert('Cannot explicitly add the variant - variant does not fit the model');
    } else {
      this.showAlert(null);
      this.explicitlyAddedVariants.push(i);
    }
  }

  addSelectedVariantsToModel() {
    // console.log(this.selectedVariants);
    // console.log(this.explicitlyAddedVariants);
    // console.log(this.variants);
    this.tooltipActivationService.close();

    if (this.outdatedConformanceStatistics) {
      this.showAlert('cannot add variants - please run conformance check first');
      return;
    }

    const explicitly_added_variants = [];
    this.explicitlyAddedVariants.forEach(i => {
      explicitly_added_variants.push(this.variants[i]);
    });

    const variants_to_add = [];
    this.selectedVariants.forEach(v => {
      variants_to_add.push(this.variants[v]);
      // update explicitly added variants TODO: do not before new tree has arrived at frontend
      this.explicitlyAddedVariants.push(v.i);
    });
    this.backendService.addVariantsToModel(variants_to_add, explicitly_added_variants);
    this.clearSelection();
  }

  clearSelection() {
    let selectedVariantsVariants = this.selectedVariants.map(i => this.variants[i]['variant']);
    this.variantsComponents.filter(c => selectedVariantsVariants.includes(c.variant))
                            .forEach(c => c.setSelected(false));
    this.selectedVariants = [];
  }

  public toggleSelect(index) {
    let variant = this.variants[index];
    let component = this.variantsComponents.find(c => c.variant === this.variants[index]['variant']);

    if (this.selectedVariants.includes(index)) {
      this.selectedVariants = this.selectedVariants.filter(i => index !== i)
      variant['variant'].forEach(v => v.setExpanded(false))
      component.setSelected(false);
    } else {
      this.selectedVariants.push(index);
      variant['variant'].forEach(v => v.setExpanded(true))
      component.setSelected(true);
    }
  }
}
