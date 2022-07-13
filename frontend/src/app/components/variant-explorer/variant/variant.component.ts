import { ProcessTreeService } from 'src/app/services/processTreeService/process-tree.service';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer.directive';

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { isDevMode } from '@angular/core';
import { LazyLoadingServiceService } from 'src/app/services/lazyLoadingService/lazy-loading.service';
import {
  getSelectedChildren,
  handleTreeLevelsWithOneChild,
  SequenceGroup,
  someChildrenSelected,
  Variant,
  VariantElement,
  InfixType,
} from '../model';
import { SharedDataService } from '../../../services/sharedDataService/shared-data.service';
import { PerformanceService } from '../../../services/performance.service';
import { ModelPerformanceColorScaleService } from '../../../services/performance-color-scale.service';
import { textColorForBackgroundColor } from '../helper_functions';
import * as objectHash from 'object-hash';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-variant]',
  templateUrl: './variant.component.html',
  styleUrls: ['./variant.component.scss'],
})
export class VariantComponent implements AfterViewInit {
  @Input()
  index: number;

  @Input()
  variant: Variant;

  @Input()
  rootElement: ElementRef;

  @Input()
  performanceMode: boolean = false;

  @Input()
  traceInfixSelectionMode: boolean = false;

  @Input()
  computeActivityColor: (
    drawerDirective: VariantDrawerDirective,
    element: VariantElement,
    variant: VariantElement
  ) => string;

  @Input()
  onClickCbFc: (
    drawerDirective: VariantDrawerDirective,
    element: VariantElement
  ) => void;

  @Input()
  onMouseOverCbFc: (
    drawerDirective: VariantDrawerDirective,
    element: VariantElement
  ) => void;

  @Input()
  processTreeAvailable: boolean = false;

  @Output()
  public selectionChanged = new EventEmitter<boolean>();

  @Output()
  public updateConformance = new EventEmitter<Variant>();

  @Output()
  public openSubvariantWindow = new EventEmitter<number>();

  @ViewChild('row')
  rowElement: ElementRef;

  @ViewChild(VariantDrawerDirective)
  variantDrawer: VariantDrawerDirective;

  @ViewChild('fragment')
  fragment: ElementRef;

  isVisible: boolean = false;
  // necessary because one cannot use it directly in the template file
  infixType = InfixType;

  // TODO: this is needed because we want to disable the selection of trace infixes for the 1.6.0 release.
  // Remove afterwards and re-enable selection.
  isDevMode = isDevMode();

  constructor(
    private lazyLoadingService: LazyLoadingServiceService,
    public performanceService: PerformanceService,
    public sharedDataService: SharedDataService,
    private performanceColorService: ModelPerformanceColorScaleService
  ) {}

  ngAfterViewInit(): void {
    const self = this;

    this.lazyLoadingService.addVariant(
      this.rowElement.nativeElement.parentNode,
      this.rootElement,
      (isIntersecting) => (self.isVisible = isIntersecting)
    );
  }

  isExpanded(): boolean {
    return this.variant.variant.expanded;
  }

  openNewSubvariantWindow(index: number) {
    this.openSubvariantWindow.emit(index);
  }

  setExpanded(expanded: boolean): void {
    if (!this.performanceMode && expanded != this.variant.variant.expanded) {
      this.variant.variant.setExpanded(expanded);

      if (this.variantDrawer) {
        this.variantDrawer.redraw();
      }
    }
  }

  redraw() {
    if (this.variantDrawer) {
      this.variantDrawer.redraw();
    }
  }

  getSVGGraphicElement(): SVGGraphicsElement {
    return this.fragment.nativeElement;
  }

  isPerformanceAvailable(variant: Variant): boolean {
    return this.performanceService.availablePerformances.has(variant);
  }

  isPerformanceActive(variant: Variant): boolean {
    return this.performanceService.activeVariant === variant;
  }

  showThisPerformance(variant: Variant): void {
    if (this.performanceService.availablePerformances.has(variant)) {
      if (this.performanceService.activeVariant == variant) {
        this.performanceService.unselectPerformance();
      } else {
        this.performanceService.setShownVariantPerformance(variant);
      }
    } else {
      if (this.performanceService.calculationInProgress.has(variant)) {
        return;
      }
      if (this.processTreeAvailable) {
        this.performanceService.updatePerformance([variant]);
      }
    }
  }

  removePerformance(variant: Variant) {
    this.performanceService.updatePerformance([], [variant]);
  }

  variantPerformanceColor(variant: Variant): string {
    let tree;
    tree = this.performanceService.variantsPerformance.get(variant);
    if (!tree) {
      return null;
    }

    let selectedScale = this.performanceColorService.selectedColorScale;
    const colorScale = this.performanceColorService
      .getVariantComparisonColorScale()
      .get(tree.id);
    if (
      colorScale &&
      tree.performance?.[selectedScale.performanceIndicator]?.[
        selectedScale.statistic
      ] !== undefined
    ) {
      return colorScale(
        tree.performance[selectedScale.performanceIndicator][
          selectedScale.statistic
        ]
      );
    }
    return '#d3d3d3';
  }

  textColorForBackgroundColor(variant: Variant): string {
    if (this.variantPerformanceColor(variant) === null) {
      return 'white';
    }
    return textColorForBackgroundColor(this.variantPerformanceColor(variant));
  }

  resetSelectionStatus(): void {
    this.variant.variant.resetSelectionStatus();
    this.variantDrawer.redraw();
  }

  addSelectedTraceInfix(): void {
    let thereAreSelectedChildren = someChildrenSelected(
      this.variant.variant,
      true
    );
    if (thereAreSelectedChildren && !this.variant.variant.selected) {
      let infixType;
      let children = this.variant.variant.getElements();
      if (children[0].selected) {
        infixType = InfixType.PREFIX;
      } else if (children[children.length - 1].selected) {
        infixType = InfixType.POSTFIX;
      } else {
        infixType = InfixType.PROPER_INFIX;
      }
      let newInfix = getSelectedChildren(this.variant.variant);
      let reducedInfix = handleTreeLevelsWithOneChild(newInfix);
      if (!(reducedInfix instanceof SequenceGroup)) {
        // Every variant should be a sequence group
        reducedInfix = new SequenceGroup([reducedInfix]);
      }
      const newVariant = new Variant(
        1,
        reducedInfix,
        false,
        false,
        0,
        false,
        true,
        false,
        true,
        [],
        infixType
      );

      let currentVariants = this.sharedDataService.variants;

      newVariant.alignment = undefined;
      newVariant.deviation = undefined;
      newVariant.id = objectHash(newVariant);

      const duplicate = currentVariants.map((v) => v.id === newVariant.id);

      if (!duplicate.includes(true)) {
        currentVariants.push(newVariant);
        this.sharedDataService.variants = currentVariants;
      } else {
        // Will think about some warning mechanism later
      }
    }
  }
}
