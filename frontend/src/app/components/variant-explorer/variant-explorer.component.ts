import { GoldenLayoutComponentService } from 'src/app/services/goldenLayoutService/golden-layout-component.service';
import { GoldenLayoutHostComponent } from 'src/app/components/golden-layout-host/golden-layout-host.component';
import {
  ComponentItem,
  ComponentItemConfig,
  GoldenLayout,
  LayoutManager,
} from 'golden-layout';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  Renderer2,
  AfterViewInit,
} from '@angular/core';

import { trigger, style, animate, transition } from '@angular/animations';

import { ComponentContainer } from 'golden-layout';
import { ColorMapService } from '../../services/colorMapService/color-map.service';
import { SharedDataService } from '../../services/sharedDataService/shared-data.service';
import { BackendService } from '../../services/backendService/backend.service';

import { Subject } from 'rxjs';
import {
  deserialize,
  ParallelGroup,
  SequenceGroup,
  VariantElement,
  Variant,
  LeafNode,
} from './model';

import { LayoutChangeDirective } from '../../directives/layout-change.directive';
import { PolygonDrawingService } from 'src/app/services/polygon-drawing.service';
import { ImageExportService } from '../../services/imageExportService/image-export-service';
import * as d3 from 'd3';
import { PerformanceService } from 'src/app/services/performance.service';
import { ModelPerformanceColorScaleService } from 'src/app/services/performance-color-scale.service';
import { VariantPerformanceService } from 'src/app/services/variant-performance.service';
import { textColorForBackgroundColor } from './helper_functions';
import { HumanizeDurationPipe } from 'src/app/pipes/humanize-duration.pipe';
import { DropzoneConfig } from '../drop-zone/drop-zone.component';
import { VariantSorter } from './variant-sorter';
import * as objectHash from 'object-hash';
import { VariantComponent } from './variant/variant.component';
import { SubvariantExplorerComponent } from './subvariant-explorer/subvariant-explorer.component';
import { ProcessTreeEditorComponent } from '../process-tree-editor/process-tree-editor.component';
import { VariantEditorComponent } from '../variant-editor/variant-editor.component';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer.directive';
import { ConformanceCheckingService } from 'src/app/services/conformanceChecking/conformance-checking.service';

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
  ],
})
export class VariantExplorerComponent
  extends LayoutChangeDirective
  implements OnInit, AfterViewInit
{
  constructor(
    private colorMapService: ColorMapService,
    private sharedDataService: SharedDataService,
    private backendService: BackendService,
    private imageExportService: ImageExportService,
    private polygonDrawingService: PolygonDrawingService,
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    elRef: ElementRef,
    renderer: Renderer2,
    public performanceService: PerformanceService,
    private performanceColorService: ModelPerformanceColorScaleService,
    private variantPerformanceService: VariantPerformanceService,
    private goldenLayoutComponentService: GoldenLayoutComponentService,
    private conformanceCheckingService: ConformanceCheckingService
  ) {
    super(elRef.nativeElement, renderer);
  }

  collapse: boolean = false;

  public variants: Variant[] = [];
  public colorMap: Map<string, string>;

  public currentlyDisplayedProcessTree;
  public usedTreeForConformanceChecking;
  protected unsubscribe: Subject<void> = new Subject<void>();

  public correctTreeSyntax = false;
  performanceMode: boolean = false;
  performanceColorMap: any;
  waitingColorMap: any;

  editorOpen: boolean = false;

  public numberFittingTraces: number = undefined;
  public numberFittingVariants: number = undefined;
  public totalNumberTraces: number = undefined;
  public totalNumberVariants = 5;

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

  ngOnInit(): void {
    this.dropZoneConfig = new DropzoneConfig(
      '.xes',
      'false',
      'false',
      '<large> Import <strong>Event Log</strong> .xes file</large>'
    );

    // preload road traffic fine management process
    this.variants = this.sharedDataService.variants;

    this.variants.forEach((v, i) => {
      v.id = objectHash(v.variant);
      v.number = i + 1;
      v.variant = deserialize(v.variant);
      v.isConformanceOutdated = true;
      v.userDefined = false;
      v.isTimeouted = false;
    });

    this.variantPerformanceService.injectWaitingTimeNodes(
      this.variants.map((v) => v.variant)
    );
    this.colorMap = this.colorMapService.getColorMap(
      Object.keys(this.sharedDataService.activitiesInEventLog)
    );
    this.colorMapService.colorMap$.subscribe((colorMap) => {
      this.colorMap = colorMap;
      this.redraw_components();
    });
    this.sharedDataService.loadedEventLog = 'preload';

    const total = this.variants.map((v) => v.count).reduce((a, b) => a + b);
    this.variants.forEach((v) => {
      v.percentage = Number.parseFloat(((v.count / total) * 100).toFixed(2));
    });

    this.numberFittingVariants = undefined;
    this.totalNumberTraces = total;
    this.totalNumberVariants = this.variants.length;

    this.sharedDataService.loadedEventLog$.subscribe((eventLog) => {
      if (eventLog) {
        this.eventLogChanged();
      }
    });

    this.sharedDataService.correctTreeSyntax$.subscribe((res) => {
      this.correctTreeSyntax = res;
    });

    this.sharedDataService.currentDisplayedProcessTree$.subscribe((tree) => {
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

    this.conformanceCheckingService.connect();
    this.subscribeForConformanceCheckingResults();
  }

  toggleVariantEditor(): void {
    if (!this.editorOpen) {
      console.log('Opening Editor');
      const editor = this._goldenLayout.findFirstComponentItemById(
        VariantEditorComponent.componentName
      );
      if (editor) {
        editor.focus();
      } else {
        const LocationSelectors: LayoutManager.LocationSelector[] = [
          {
            typeId: LayoutManager.LocationSelector.TypeId.FocusedStack,
            index: undefined,
          },
        ];

        this._goldenLayout
          .findFirstComponentItemById(ProcessTreeEditorComponent.componentName)
          .focus();

        const itemConfig: ComponentItemConfig = {
          id: VariantEditorComponent.componentName,
          type: 'component',
          title: 'Variant Explorer',
          isClosable: false,
          reorderEnabled: false,
          componentType: VariantEditorComponent.componentName,
        };

        this._goldenLayout.addItemAtLocation(itemConfig, LocationSelectors);
      }
    } else {
      console.log('Closing Editor');
      this._goldenLayout
        .findFirstComponentItemById(ProcessTreeEditorComponent.componentName)
        .focus();
    }

    this.editorOpen = !this.editorOpen;
  }

  ngAfterViewInit() {
    this.polygonDrawingService.setElementRefereneces(
      this.variantExplorerContainer,
      this.tooltipContainer
    );

    this._goldenLayoutHostComponent =
      this.goldenLayoutComponentService.goldenLayoutHostComponent;
    this._goldenLayout = this.goldenLayoutComponentService.goldenLayout;

    console.log(this._goldenLayoutHostComponent);
    console.log(this._goldenLayout);

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
    this.variantPerformanceService.injectWaitingTimeNodes(
      this.variants.map((v) => v.variant)
    );

    this.variants.forEach((v) => {
      v.isSelected = false;
      v.isAddedFittingVariant = false;
      v.isConformanceOutdated = true;
      v.userDefined = false;
      v.isTimeouted = false;
    });

    this.numberFittingVariants = undefined;
    this.numberFittingTraces = undefined;

    this.totalNumberTraces = this.variants
      .map((v) => v.count)
      .reduce((a, b) => a + b);
    this.totalNumberVariants = this.variants.length;
    this.sort(this.sortingFeature);
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
      this.sharedDataService.currentDisplayedProcessTree,
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
    console.log('Creating Window at', index);

    const LocationSelectors: LayoutManager.LocationSelector[] = [
      {
        typeId: LayoutManager.LocationSelector.TypeId.FocusedStack,
        index: undefined,
      },
    ];

    this.cleanUpSubVariantMap();

    const id =
      SubvariantExplorerComponent.componentName + this.variants[index - 1].id;

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
        title: 'Sub-Variant ' + index,
        isClosable: true,
        reorderEnabled: false,
        componentState: this.variants[index - 1],
        componentType: SubvariantExplorerComponent.componentName,
      };

      this._goldenLayout.addItemAtLocation(itemConfig, LocationSelectors);
      componentItem = this._goldenLayout.findFirstComponentItemById(id);
      this._subvariantcomponentItemsMap.set(id, componentItem);

      componentItem.focus();
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
    for (let index = 0; index < this.variants.length; index++) {
      const id =
        SubvariantExplorerComponent.componentName + this.variants[index].id;
      let componentItem = this._subvariantcomponentItemsMap.get(id);
      if (componentItem) {
        componentItem.setTitle('Sub-Variant ' + (index + 1));
      }
    }
  }

  cleanUpSubVariantMap() {
    for (let index = 0; index < this.variants.length; index++) {
      const id =
        SubvariantExplorerComponent.componentName + this.variants[index].id;
      let componentItem = this._subvariantcomponentItemsMap.get(id);
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

  setPerformanceMode(performanceMode: boolean): void {
    this.performanceMode = performanceMode;
    this.variantPerformanceService.variantPerformanceMode.next(performanceMode);
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

  areAllVariantsSelected(): boolean {
    return this.getSelectedVariants().length >= this.totalNumberVariants;
  }

  unSelectAllChanged(isSelected: boolean): void {
    this.variants.forEach((v) => (v.isSelected = isSelected));
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
      this.sharedDataService.currentDisplayedProcessTree =
        this.performanceService.mergedPerformance;
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

  variantClickCallBack = (
    self: VariantDrawerDirective,
    element: VariantElement,
    variant: VariantElement
  ) => {
    if (this.performanceMode) {
      self.changeSelected(element);
      this.variantPerformanceService.setSelectedVariantElement(element);
    } else {
      variant.setExpanded(!variant.getExpanded());
      self.redraw();
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

  sort(sortingFeature: string): void {
    this.sortingFeature = sortingFeature;
    this.variants = VariantSorter.sort(
      this.variants,
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
}

export namespace VariantExplorerComponent {
  export const componentName = 'VariantExplorerComponent';
}
