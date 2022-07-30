import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import * as d3 from 'd3';
import {
  ComponentContainer,
  ComponentItem,
  ComponentItemConfig,
  GoldenLayout,
  LayoutManager,
  LogicalZIndex,
  Stack,
} from 'golden-layout';
import { Subject } from 'rxjs';
import { delay, mergeMap, retryWhen, take, tap } from 'rxjs/operators';
import { GoldenLayoutHostComponent } from 'src/app/components/golden-layout-host/golden-layout-host.component';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer.directive';
import { TimeUnit } from 'src/app/objects/TimeUnit';
import { HumanizeDurationPipe } from 'src/app/pipes/humanize-duration.pipe';
import { ConformanceCheckingService } from 'src/app/services/conformanceChecking/conformance-checking.service';
import { GoldenLayoutComponentService } from 'src/app/services/goldenLayoutService/golden-layout-component.service';
import { LogService } from 'src/app/services/logService/log.service';
import { ModelPerformanceColorScaleService } from 'src/app/services/performance-color-scale.service';
import { PerformanceService } from 'src/app/services/performance.service';
import { PolygonDrawingService } from 'src/app/services/polygon-drawing.service';
import { ProcessTreeService } from 'src/app/services/processTreeService/process-tree.service';
import { VariantPerformanceService } from 'src/app/services/variant-performance.service';
import { originalOrder } from 'src/app/utils/util';
import { LayoutChangeDirective } from '../../directives/layout-change.directive';
import { BackendService } from '../../services/backendService/backend.service';
import { ColorMapService } from '../../services/colorMapService/color-map.service';
import { ImageExportService } from '../../services/imageExportService/image-export-service';
import { SharedDataService } from '../../services/sharedDataService/shared-data.service';
import { DropzoneConfig } from '../drop-zone/drop-zone.component';
import { textColorForBackgroundColor } from './helper_functions';
import {
  getLowestSelectionActionableElement,
  InfixType,
  LeafNode,
  ParallelGroup,
  SequenceGroup,
  setParent,
  Variant,
  VariantElement,
} from './model';
import { SubvariantExplorerComponent } from './subvariant-explorer/subvariant-explorer.component';
import { VariantSorter } from './variant-sorter';
import { VariantComponent } from './variant/variant.component';

@Component({
  selector: 'app-variant-explorer',
  templateUrl: './variant-explorer.component.html',
  styleUrls: ['./variant-explorer.component.scss'],
  animations: [
    trigger('collapseText', [
      transition(':enter', [
        style({ opacity: '0', transform: 'translateX(-40px)' }),
        animate(
          '100ms 50ms ease-in',
          style({ opacity: '1', transform: 'translateX(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '100ms 50ms ease-in',
          style({ opacity: '0', transform: 'translateX(-50px)' })
        ),
      ]),
    ]),
    trigger('openCloseQuery', [
      // ...
      state(
        'openQuery',
        style({
          height: '75%',
          width: '55%',
          overflow: 'hidden',
        })
      ),
      state(
        'closeQuery',
        style({
          height: '25px',
          width: '25px',
          overflow: 'hidden',
        })
      ),
      transition('openQuery => closeQuery', [animate('175ms')]),
      transition('closeQuery => openQuery', [animate('175ms')]),
    ]),
    trigger('fadeInOutQuery', [
      // ...
      state(
        'fadeInQuery',
        style({
          opacity: '1',
          width: '100%',
          height: '100%',
        })
      ),
      state(
        'fadeOutQuery',
        style({
          opacity: '0',
          width: '0%',
          height: '0%',
        })
      ),
      transition('fadeInQuery => fadeOutQuery', [animate('175ms')]),
      transition('fadeOutQuery => fadeInQuery', [animate('175ms')]),
    ]),
  ],
})
export class VariantExplorerComponent
  extends LayoutChangeDirective
  implements OnInit, AfterViewInit
{
  displayed_variants: any;
  constructor(
    private colorMapService: ColorMapService,
    private sharedDataService: SharedDataService,
    private backendService: BackendService,
    private logService: LogService,
    private imageExportService: ImageExportService,
    private polygonDrawingService: PolygonDrawingService,
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    public processTreeService: ProcessTreeService,
    elRef: ElementRef,
    renderer: Renderer2,
    public performanceService: PerformanceService,
    private performanceColorService: ModelPerformanceColorScaleService,
    private variantPerformanceService: VariantPerformanceService,
    private conformanceCheckingService: ConformanceCheckingService,
    private goldenLayoutComponentService: GoldenLayoutComponentService,
    private ref: ChangeDetectorRef
  ) {
    super(elRef.nativeElement, renderer);
  }

  collapse: boolean = false;
  maximized: boolean = false;

  public variants: Variant[] = [];
  public colorMap: Map<string, string>;
  public sidebarHeigth = 0;

  public currentlyDisplayedProcessTree;
  public usedTreeForConformanceChecking;
  protected unsubscribe: Subject<void> = new Subject<void>();

  public correctTreeSyntax = false;
  performanceMode: boolean = false;
  expansionState: Map<string, boolean> = new Map<string, boolean>();
  performanceColorMap: any;
  waitingColorMap: any;

  public numberFittingTraces: number = undefined;
  public numberFittingVariants: number = undefined;
  public totalNumberTraces: number = undefined;
  public totalNumberVariants: number = undefined;

  public svgRenderingInProgress: boolean = false;
  public variantExplorerOutOfFocus: boolean = false;

  _goldenLayoutHostComponent: GoldenLayoutHostComponent;
  _goldenLayout: GoldenLayout;
  _subvariantcomponentItemsMap: Map<string, ComponentItem> = new Map<
    string,
    ComponentItem
  >();

  dropZoneConfig: DropzoneConfig;
  public isAscendingOrder: boolean = false;
  public sortingFeature: string = 'count';
  queryActive: boolean = false;
  showQueryInfo: boolean = false;

  public traceInfixSelectionMode: boolean = false;

  @ViewChild('variantExplorer', { static: true })
  variantExplorerDiv: ElementRef<HTMLDivElement>;

  @ViewChildren(VariantComponent)
  variantComponents: QueryList<VariantComponent>;

  @ViewChild('variantExplorerContainer')
  variantExplorerContainer: ElementRef<HTMLDivElement>;

  @ViewChild('tooltipContainer')
  tooltipContainer: ElementRef<HTMLDivElement>;

  public visibleVariantsHeight = 1000;

  showConformanceDialogEvent: Subject<Variant> = new Subject<Variant>();

  timeUnit = TimeUnit;

  selectedGranularity = TimeUnit.SEC;

  originalOrder = originalOrder;

  ngOnInit(): void {
    this.dropZoneConfig = new DropzoneConfig(
      '.xes',
      'false',
      'false',
      '<large> Import <strong>Event Log</strong> .xes file</large>'
    );

    // initialize variables and initial variants
    this.init();
    // update variant explorer on log change
    this.listenForLogChange();
    // redraw variants on color map change
    this.listenForColorMapChange();
    // update view when activity names change
    this.listenForActivityNamesChange();
    this.listenForCorrectSyntax();
    this.listenForProcessTreeChange();
    this.conformanceCheckingService.connect();
    this.subscribeForConformanceCheckingResults();
  }

  @HostListener('window:keydown.control.q', ['$event'])
  onOpenQuery(e) {
    this.toggleQuery();
  }

  ngAfterViewInit() {
    this.polygonDrawingService.setElementRefereneces(
      this.variantExplorerContainer,
      this.tooltipContainer
    );

    this._goldenLayoutHostComponent =
      this.goldenLayoutComponentService.goldenLayoutHostComponent;
    this._goldenLayout = this.goldenLayoutComponentService.goldenLayout;

    const variantExplorerItem = this._goldenLayout.findFirstComponentItemById(
      VariantExplorerComponent.componentName
    );

    variantExplorerItem.focus();

    this.variantPerformanceService.serviceTimeColorMap.subscribe((colorMap) => {
      if (colorMap !== undefined) {
        this.performanceColorMap = colorMap;
        this.redraw_components();
      }
    });

    this.variantPerformanceService.waitingTimeColorMap.subscribe((colorMap) => {
      if (colorMap !== undefined) {
        this.waitingColorMap = colorMap;
        this.redraw_components();
      }
    });

    this.variantPerformanceService.variantPerformanceMode.subscribe(
      (isPerformanceModeActive) =>
        this.setPerformanceMode(isPerformanceModeActive, false)
    );
  }

  private init() {
    this.displayed_variants = [];
    this.logService
      .resetLogCache() // for now show the sample log again on reload
      .pipe(retryWhen((errors) => errors.pipe(delay(500), take(50)))) // backend might need some time to start up
      .pipe(
        mergeMap(() =>
          // Time granularity is null because the granularity is determined in the backend
          this.logService.getLogPropsAndUpdateState(null, 'preload')
        )
      )
      .subscribe();
  }

  private listenForProcessTreeChange() {
    this.processTreeService.currentDisplayedProcessTree$.subscribe((tree) => {
      this.currentlyDisplayedProcessTree = tree;
      const treeHasChanged = !this.sharedDataService.processTreesEqual(
        this.usedTreeForConformanceChecking,
        this.currentlyDisplayedProcessTree
      );

      if (treeHasChanged) {
        this.variants.forEach((v) => {
          v.isAddedFittingVariant = false;
          v.isConformanceOutdated = true;
        });
      }
    });
  }

  private listenForCorrectSyntax() {
    this.processTreeService.correctTreeSyntax$.subscribe((res) => {
      this.correctTreeSyntax = res;
    });
  }

  private listenForActivityNamesChange() {
    this.sharedDataService.activityNamesChanged$.subscribe(
      (activityNameMapping) => {
        this.activityNamesChanged();
      }
    );
  }

  private listenForColorMapChange() {
    this.colorMapService.colorMap$.subscribe((colorMap) => {
      this.colorMap = colorMap;
      this.redraw_components();
    });
  }

  private listenForLogChange() {
    this.sharedDataService.loadedEventLog$
      .pipe(
        tap(() => {
          this.closeAllSubvariantWindows();
          this.performanceMode = false;
          this.variantPerformanceService.variantPerformanceMode.next(false);
          this.eventLogChanged();
        })
      )
      .subscribe();
  }

  private redraw_components() {
    if (this.variantComponents) {
      for (let component of this.variantComponents) {
        component.redraw();
      }
    }
  }

  private eventLogChanged(): void {
    this.colorMap = this.colorMapService.getColorMap(
      Object.keys(this.sharedDataService.activitiesInEventLog)
    );

    this.variants = this.sharedDataService.variants;
    this.displayed_variants = this.variants;

    this.variantPerformanceService.injectWaitingTimeNodes(
      this.variants.map((v) => v.variant)
    );

    this.variants.forEach((v, i) => {
      v.isConformanceOutdated = true;
      v.userDefined = false;
      v.isTimeouted = false;
      v.isSelected = false;
      v.isAddedFittingVariant = false;
      v.infixType = InfixType.NOT_AN_INFIX;
      setParent(v.variant);
    });

    this.numberFittingVariants = undefined;
    this.numberFittingTraces = undefined;

    this.totalNumberTraces = this.variants
      .map((v) => v.count)
      .reduce((a, b) => a + b);

    this.variants.forEach((v) => {
      v.percentage = Number.parseFloat(
        ((v.count / this.totalNumberTraces) * 100).toFixed(2)
      );
    });
    this.totalNumberVariants = this.variants.length;
    this.sort(this.sortingFeature);
    console.log('Variants after load:', this.variants);
  }

  private activityNamesChanged(): void {
    // Changes to variants in shared data service are made in activity overview
    this.variants = this.sharedDataService.variants;
  }

  subscribeForConformanceCheckingResults(): void {
    this.conformanceCheckingService.results.subscribe(
      (res) => {
        const variant = this.variants.find((v) => v.id == res.id);
        variant.calculationInProgress = false;
        variant.isTimeouted = res.isTimeout;
        variant.isConformanceOutdated = res.isTimeout;

        if (!res.isTimeout) {
          variant.deviation = res.deviation;
        }

        this.updateAlignmentStatistics();
      },
      (_) => {
        this.variants.forEach((v) => {
          v.calculationInProgress = false;
          v.alignment = undefined;
          v.deviation = undefined;
        });

        this.updateAlignmentStatistics();
      }
    );
  }

  apply_query_filter(queryItems: Set<number>) {
    console.log('Changed Filter', queryItems);
    console.log('Current Variants', this.variants);

    if (!queryItems) {
      this.displayed_variants = this.variants;
    } else {
      this.displayed_variants = this.variants.filter((variant) => {
        return queryItems.has(variant.bid);
      });
    }

    this.updateAllSubvariantWindows();
  }

  updateAlignments(): void {
    this.usedTreeForConformanceChecking = this.currentlyDisplayedProcessTree;

    this.variants.forEach((v) => {
      this.updateConformanceForVariant(v, 0);
    });
  }

  updateAlignmentStatistics(): void {
    let numberFittingVariants = 0;
    let numberFittingTraces = 0;

    this.variants.forEach((v) => {
      if (v.deviation !== undefined && !v.deviation) {
        numberFittingVariants++;
        numberFittingTraces += v.count;
      }
    });
    this.numberFittingTraces = numberFittingTraces;
    this.numberFittingVariants = numberFittingVariants;
  }

  updateConformanceForVariant(variant: Variant, timeout: number): void {
    variant.calculationInProgress = true;
    variant.deviation = undefined;

    const resubscribe = this.conformanceCheckingService.calculateConformance(
      variant.id,
      variant.infixType,
      this.processTreeService.currentDisplayedProcessTree,
      variant.variant.serialize(),
      timeout
    );

    if (resubscribe) {
      this.subscribeForConformanceCheckingResults();
    }
  }

  updateConformanceForSingleVariantClicked(variant: Variant): void {
    if (variant.isTimeouted) {
      this.showConformanceDialogEvent.next(variant);
    } else {
      this.updateConformanceForVariant(variant, 0);
    }
  }

  discoverInitialModel(): void {
    const variants = this.getSelectedVariants().map((v) => v.variant);

    this.backendService
      .discoverProcessModelFromConcurrencyVariants(variants)
      .subscribe((_) => this.refreshConformanceIconsAfterModelChange(true));
  }

  genSimpleVariants(variant: VariantElement): any {
    if (variant instanceof SequenceGroup) {
      return variant.elements;
    } else if (variant instanceof ParallelGroup) {
    } else {
      return [variant.asLeafNode().activity];
    }
  }

  mapVariantToEventList(variant): any {
    return {
      events: variant
        .flat()
        .filter((v) => v[1].toLowerCase() === 'complete')
        .map((v) => `${v[0]}`),
    };
  }

  selectionChangedForVariant(variant: Variant, isSelected: boolean): void {
    variant.isSelected = isSelected;
  }

  addSelectedVariantsToModel(): void {
    const selectedVariants = this.getSelectedVariants();

    // TODO we currently distinguish two cases here: 1. outdated conformance and 2. known conformance
    // in the future, we want to use caching in the backend and use only a single call from frontend
    if (this.isAnyVariantOutdated(selectedVariants)) {
      this.addSelectedVariantsToModelForOutdatedConformance(selectedVariants);
      return;
    }

    this.addSelectedVariantsToModelForGivenConformance(selectedVariants);
  }

  createSubVariantView(index) {
    const currently_maximized = this.maximized;

    const LocationSelectors: LayoutManager.LocationSelector[] = [
      {
        typeId: LayoutManager.LocationSelector.TypeId.FocusedStack,
        index: undefined,
      },
    ];

    this.cleanUpSubVariantMap();

    const id =
      SubvariantExplorerComponent.componentName +
      this.displayed_variants[index - 1].id;

    let componentItem = this._subvariantcomponentItemsMap.get(id);

    // Check if the component item reference already is stored and if the item still exists
    // Saves on a search by ID
    if (componentItem) {
      componentItem.focus();

      // Instantiate a new Subvariant Component for this variant if it did not exist or is closed
    } else {
      const variantExplorerItem = this._goldenLayout.findFirstComponentItemById(
        VariantExplorerComponent.componentName
      );

      variantExplorerItem.focus();

      const itemConfig: ComponentItemConfig = {
        id: id,
        type: 'component',
        title: 'Sub-Variants for ' + index,
        isClosable: true,
        reorderEnabled: true,
        componentState: this.displayed_variants[index - 1],
        maximised: true,
        componentType: SubvariantExplorerComponent.componentName,
      };

      this._goldenLayout.addItemAtLocation(itemConfig, LocationSelectors);
      componentItem = this._goldenLayout.findFirstComponentItemById(id);
      this._subvariantcomponentItemsMap.set(id, componentItem);

      // Keep the stack maximized
      if (currently_maximized) {
        const stack = componentItem.container.parent.parent as Stack;
        stack.toggleMaximise();
      }

      variantExplorerItem.focus();
    }
  }

  closeAllSubvariantWindows(): void {
    this._subvariantcomponentItemsMap.forEach((value) => {
      if (
        value &&
        this._goldenLayoutHostComponent.getComponentRef(value.container)
      ) {
        value.close();
      }
    });

    // Reset the Map to empty
    this._subvariantcomponentItemsMap = new Map<string, ComponentItem>();
  }

  updateAllSubvariantWindows(): void {
    this._subvariantcomponentItemsMap.forEach((value) => {
      if (value) {
        value.setTitle('Sub-Variant');
      }
    });

    for (let index = 0; index < this.displayed_variants.length; index++) {
      const id =
        SubvariantExplorerComponent.componentName +
        this.displayed_variants[index].id;
      let componentItem = this._subvariantcomponentItemsMap.get(id);
      if (componentItem) {
        componentItem.setTitle('Sub-Variants for ' + (index + 1));
      }
    }
  }

  cleanUpSubVariantMap() {
    for (let index = 0; index < this.variants.length; index++) {
      const id =
        SubvariantExplorerComponent.componentName + this.variants[index].id;
      const componentItem = this._subvariantcomponentItemsMap.get(id);
      if (
        componentItem &&
        !this._goldenLayoutHostComponent.getComponentRef(
          componentItem.container
        )
      ) {
        this._subvariantcomponentItemsMap.delete(id);
      }
    }
  }

  removeAllFilters() {
    this.displayed_variants = this.variants;
    this.updateAllSubvariantWindows();
  }

  getSelectedVariants(): Variant[] {
    return this.variants.filter((v) => v.isSelected);
  }

  isAnyVariantOutdated(variants: Variant[]): boolean {
    return variants.some((v) => v.isConformanceOutdated);
  }

  isConformanceOutdated(): boolean {
    return this.isAnyVariantOutdated(this.variants);
  }

  isAlignmentCalculationInProgress(): boolean {
    return this.variants.some((v) => v.calculationInProgress);
  }

  addSelectedVariantsToModelForOutdatedConformance(
    selectedVariants: Variant[]
  ): void {
    const selectedVariantElements = selectedVariants.map((v) => v.variant);

    this.backendService
      .addConcurrencyVariantsToProcessModelForUnknownConformance(
        selectedVariantElements
      )
      .subscribe((_) => {
        this.refreshConformanceIconsAfterModelChange(false);
      });
  }

  setPerformanceMode(
    performanceMode: boolean,
    forwardUpdate: boolean = true
  ): void {
    if (performanceMode) {
      this.variants.map((variant) => {
        this.expansionState.set(variant.id, variant.variant.getExpanded());
      });
    } else {
      // Return everything to its previous state
      this.variants.forEach((variant, i) =>
        variant.variant.setExpanded(this.expansionState.get(variant.id))
      );
    }

    this.performanceMode = performanceMode;
    if (forwardUpdate) {
      this.variantPerformanceService.variantPerformanceMode.next(
        performanceMode
      );
    }
  }

  addSelectedVariantsToModelForGivenConformance(
    selectedVariants: Variant[]
  ): void {
    const fittingVariants = selectedVariants
      .filter((v) => !v.deviation)
      .map((v) => v.variant);
    const variantsToAdd = selectedVariants
      .filter((v) => v.deviation)
      .map((v) => v.variant);

    this.backendService
      .addConcurrencyVariantsToProcessModel(variantsToAdd, fittingVariants)
      .subscribe((_) => {
        this.refreshConformanceIconsAfterModelChange(false);
      });
  }

  refreshConformanceIconsAfterModelChange(wasInitialDiscovery: boolean): void {
    if (wasInitialDiscovery) {
      this.variants.forEach((v) => {
        v.deviation = undefined;
        v.calculationInProgress = false;
      });
    }

    this.getSelectedVariants().forEach((v) => {
      v.isAddedFittingVariant = true;
      v.deviation = false;
      v.calculationInProgress = false;
      v.isConformanceOutdated = false;
    });

    this.usedTreeForConformanceChecking = this.currentlyDisplayedProcessTree;
  }

  isAnyVariantSelected(): boolean {
    return this.variants.some((v) => v.isSelected);
  }

  isNoVariantSelected(): boolean {
    return !this.isAnyVariantSelected();
  }

  areAllDisplayedVariantsSelected(): boolean {
    return this.displayed_variants.every((v) => v.isSelected);
  }

  unSelectAllChanged(isSelected: boolean): void {
    this.displayed_variants.forEach((v) => (v.isSelected = isSelected));
  }

  areAllVariantsExpanded(): boolean {
    if (this.variantComponents === undefined) {
      return false;
    }
    const unexpandedVariantsExist = this.variants.some(
      (v) => !v.variant.expanded
    );
    return !unexpandedVariantsExist;
  }

  unExpandAll(): void {
    const shouldExpand = !this.areAllVariantsExpanded();
    this.variantComponents.forEach((c) => c.setExpanded(shouldExpand));
  }

  handleResponsiveChange(
    left: number,
    top: number,
    width: number,
    height: number
  ): void {
    this.collapse = width < 875;

    this.sidebarHeigth = height;
  }

  handleVisibilityChange(visibility: boolean): void {}

  handleZIndexChange(
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void {
    this.maximized = logicalZIndex === 'stackMaximised';
  }

  performanceAvailable(): boolean {
    return this.performanceService.mergedPerformance !== undefined;
  }

  isMeanPerformanceActive(): boolean {
    return this.performanceService.activeVariant === undefined;
  }

  showMeanPerformance(): void {
    if (this.performanceService.activeVariant === undefined) {
      this.performanceService.unselectPerformance();
    } else {
      this.performanceService.activeVariant = undefined;
      this.processTreeService.set_currentDisplayedProcessTree_with_Cache(
        this.performanceService.mergedPerformance
      );
    }
  }

  meanPerformance(): string {
    let p = this.performanceService.mergedPerformance?.performance;
    let selectedScale = this.performanceColorService.selectedColorScale;
    let pValue =
      p[selectedScale.performanceIndicator]?.[selectedScale.statistic];
    return HumanizeDurationPipe.apply(pValue * 1000, { round: true });
  }

  variantPerformanceColor(): string {
    let tree = this.performanceService.mergedPerformance;
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

  textColorForBackgroundColor(): string {
    if (this.variantPerformanceColor() === null) {
      return 'white';
    }
    return textColorForBackgroundColor(this.variantPerformanceColor());
  }

  toggleQueryInfo(event: Event): void {
    this.showQueryInfo = !this.showQueryInfo;
    event.stopPropagation();
  }

  variantClickCallBack = (
    drawer: VariantDrawerDirective,
    element: VariantElement,
    variant: VariantElement
  ) => {
    if (this.performanceMode) {
      drawer.changeSelected(element);
      if (element.serviceTime) {
        this.variantPerformanceService.setPerformanceStatsSelectedVariantElement(
          element.serviceTime,
          true
        );
      }
      if (element.waitingTime) {
        this.variantPerformanceService.setPerformanceStatsSelectedVariantElement(
          element.waitingTime,
          false
        );
      }
    } else if (this.traceInfixSelectionMode) {
      let lowestSelectableNode = getLowestSelectionActionableElement(element);

      if (lowestSelectableNode != variant) {
        if (lowestSelectableNode.unselectable)
          lowestSelectableNode.setAllChildrenUnselected();
        else lowestSelectableNode.setAllChildrenSelected();

        variant.updateSelectionAttributes();
        drawer.redraw();
      }
    } else {
      variant.setExpanded(!variant.getExpanded());
      drawer.redraw();
    }
  };

  computeActivityColor = (
    self: VariantDrawerDirective,
    element: VariantElement,
    variant: Variant
  ) => {
    let color;

    if (element instanceof LeafNode) {
      color = this.colorMap.get(element.asLeafNode().activity[0]);

      // in this case cuts were not applicable anymore.
      // The resulting chevron is displayed in gray
      if (element.activity.length > 1) {
        color = '#d3d3d3'; // lightgray
      }

      if (element.serviceTime?.mean !== undefined && this.performanceMode) {
        let stat = this.variantPerformanceService.serviceTimeStatistic;
        color = this.performanceColorMap(element.serviceTime[stat]);
        if (color == undefined) {
          color = '#d3d3d3'; // lightgrey
        }
      } else if (this.performanceMode && variant.variant?.serviceTime) {
        color = '#d3d3d3';
      }
    } else {
      if (this.performanceMode && element.waitingTime?.mean !== undefined) {
        let stat = this.variantPerformanceService.waitingTimeStatistic;
        color = this.waitingColorMap(element.waitingTime[stat]);
      }
    }

    if (!color) {
      color = '#d3d3d3'; // lightgrey
    }

    return color;
  };

  exportVariantSVG() {
    let svgs: SVGGraphicsElement[] = [];
    let state: boolean[] = [];

    this.svgRenderingInProgress = true;

    const visibleComponents = this.variantComponents.filter((c) => c.isVisible);

    // Get current expansion state
    visibleComponents.forEach((c) => state.push(c.isExpanded()));

    // Expand the elements and redraw them
    visibleComponents.forEach((c) => c.setExpanded(true));

    // Collect the SVG and pass them to the SVG Service
    visibleComponents.forEach((c) => svgs.push(c.getSVGGraphicElement()));

    // Add Frequency and Percentage information to the SVG
    svgs = svgs.map((c, i) =>
      this.addVariantInformation(
        c,
        this.variants[i].count,
        this.variants[i].percentage
      )
    );

    // TODO Create the Legend Element and add it
    const legend = d3.create('svg').attr('x', '10').attr('y', '10');

    let leafnodes: LeafNode[] = [];

    for (let activity in this.sharedDataService.activitiesInEventLog) {
      leafnodes.push(new LeafNode([activity]));
    }

    svgs.forEach((svg) => {
      svg.removeAttribute('ng-reflect-variant');
      svg.removeAttribute('ng-reflect-on-click-cb-fc');
      svg.removeAttribute('ng-reflect-performance-mode');
      svg.removeAttribute('ng-reflect-compute-activity-color');
      svg.removeAttribute('appVariantDrawer');
      svg.removeAttribute('class');
      d3.select(svg).selectAll('text').attr('data-bs-original-title', null);
    });

    this.polygonDrawingService.drawLegend(leafnodes, legend, this.colorMap);

    svgs.unshift(legend.node());

    // Send all Elements to the export service
    this.imageExportService.export('variant_explorer', 0, 0, ...svgs);

    // Return everything to its previous state
    visibleComponents.forEach((c, i) => c.setExpanded(state[i]));

    // Hide the Spinner
    this.svgRenderingInProgress = false;
  }

  addVariantInformation(
    svgElement: SVGGraphicsElement,
    variantAbs: number,
    variantPerc: number
  ): SVGGraphicsElement {
    const exportMarginX: number = 65;
    const exportMarginY: number = 15;

    const svgElement_copy = svgElement.cloneNode(true) as SVGGraphicsElement;

    // Shift all Elements to the right using transform chaining
    svgElement_copy.setAttribute(
      'width',
      (svgElement.clientWidth + exportMarginX).toString()
    );
    svgElement_copy.setAttribute(
      'height',
      (svgElement.clientHeight + exportMarginY).toString()
    );

    d3.select(svgElement_copy)
      .select('g')
      .selectChildren()
      .each(function (this: SVGGraphicsElement) {
        this.setAttribute(
          'transform',
          (this.getAttribute('transform')
            ? this.getAttribute('transform') + ','
            : '') + `translate(${exportMarginX}, 0)`
        );
      });
    // Add the Frequency Information
    const textfield = d3
      .select(svgElement_copy)
      .append('text')
      .attr(
        'transform',
        `translate(20, ${(svgElement.clientHeight - 25) / 2 + 10})`
      )
      .attr('height', 20)
      .attr('width', 50)
      .attr('font-size', 9)
      .attr('fill', 'black');

    textfield
      .append('tspan')
      .attr('x', 0)
      .attr('dy', 0)
      .attr('height', 9)
      .attr('fill', 'black')
      .text(variantPerc + '%');

    textfield
      .append('tspan')
      .attr('x', 0)
      .attr('dy', 10)
      .attr('height', 9)
      .attr('fill', 'black')
      .text('(' + variantAbs + ')');

    return svgElement_copy;
  }

  toggleBlur(event) {
    this.variantExplorerOutOfFocus = event;
  }

  toggleQuery() {
    console.log('Toggle Query:', this.queryActive);
    this.queryActive = !this.queryActive;
  }

  sort(sortingFeature: string): void {
    this.sortingFeature = sortingFeature;
    this.displayed_variants = VariantSorter.sort(
      this.displayed_variants,
      this.sortingFeature,
      this.isAscendingOrder
    );
    this.variantExplorerDiv.nativeElement.scroll(0, 0);
    this.updateAllSubvariantWindows();
  }

  onSortOrderChanged(isAscending: boolean): void {
    this.isAscendingOrder = isAscending;
    this.sort(this.sortingFeature);
  }

  toggleTraceInfixSelectionMode(): void {
    this.traceInfixSelectionMode = !this.traceInfixSelectionMode;
    this.redraw_components();
  }

  onGranularityChange(granularity): void {
    if (this.processTreeService.currentDisplayedProcessTree)
      this.performanceService.unselectPerformance();

    this.selectedGranularity = granularity;
    this.sharedDataService.timeGranularity = granularity;
    this.logService
      .getLogPropsAndUpdateState(
        granularity,
        this.sharedDataService.loadedEventLog
      )
      .subscribe();
  }
}

export namespace VariantExplorerComponent {
  export const componentName = 'VariantExplorerComponent';
}
