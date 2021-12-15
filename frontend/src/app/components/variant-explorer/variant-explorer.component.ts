import { SubvariantExplorerComponent } from './subvariant-explorer/subvariant-explorer.component';
import { GoldenLayoutHostComponent } from 'src/app/components/golden-layout-host/golden-layout-host.component';
import { ComponentItemConfig, GoldenLayout, LayoutManager } from 'golden-layout';
import { GoldenLayoutComponentService } from './../../services/goldenLayoutService/golden-layout-component.service';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  AfterContentChecked,
  QueryList,
  ViewChild,
  ViewChildren,
  Renderer2,
  AfterViewInit
} from '@angular/core';

import {
  trigger,
  style,
  animate,
  transition
} from '@angular/animations';

import { ComponentContainer } from 'golden-layout';
import { ColorMapService } from '../../services/colorMapService/color-map.service';
import { SharedDataService } from '../../services/sharedDataService/shared-data.service';
import { BackendService } from '../../services/backendService/backend.service';

import { ActivateTooltipsService } from '../../services/activateTooltipsService/activate-tooltips.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { deserialize, ParallelGroup, SequenceGroup, VariantElement, Variant, LeafNode } from './model';
import { VariantFragmentComponent } from './variant-fragment/variant-fragment.component';
import { LayoutChangeDirective } from '../../directives/layout-change.directive';
import { PolygonDrawingService } from 'src/app/services/polygon-drawing.service';
import { ImageExportService } from '../../services/imageExportService/image-export-service';
import * as d3 from 'd3';

@Component({
  selector: 'app-variant-explorer',
  templateUrl: './variant-explorer.component.html',
  styleUrls: ['./variant-explorer.component.scss'],
  animations: [
              trigger('collapseText', [
                transition(':enter', [
                  style({ opacity : '0', transform : 'translateX(-40px)'}),
                  animate('100ms 50ms ease-in', style({ opacity : '1',  transform : 'translateX(0)'})),
                ]),
                transition(':leave', [
                  animate('100ms 50ms ease-in', style({ opacity : '0',  transform : 'translateX(-50px)'}))
                ])
              ])
            ]
})
export class VariantExplorerComponent extends LayoutChangeDirective implements OnInit, AfterContentChecked, AfterViewInit {
  constructor(private colorMapService: ColorMapService,
    private sharedDataService: SharedDataService,
    private goldenLayoutComponentService : GoldenLayoutComponentService,
    private backendService: BackendService,
    private imageExportService: ImageExportService,
    private polygonDrawingService: PolygonDrawingService,
    private tooltipActivationService: ActivateTooltipsService,
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken) private container: ComponentContainer,
    elRef: ElementRef,
    renderer: Renderer2
  ) {
    super(elRef.nativeElement, renderer);
    const state = this.container.initialState;
  }

  private readonly nVariantsInc = 50;
  collapse : boolean = false;

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

  public numberFittingTraces: number = undefined;
  public numberFittingVariants: number = undefined;
  public totalNumberTraces: number = undefined;
  public totalNumberVariants = 5;

  public alignmentCalculationInProgress = false;
  public svgRenderingInProgress: boolean = false;

  _goldenLayoutHostComponent : GoldenLayoutHostComponent;
  _goldenLayout : GoldenLayout;

  @ViewChild('variantExplorer', { static: true })
  variantExplorerDiv: ElementRef<HTMLDivElement>;

  @ViewChildren(VariantFragmentComponent)
  variantComponents: QueryList<VariantFragmentComponent>;

  @ViewChild('variantExplorerContainer') variantExplorerContainer: ElementRef<HTMLDivElement>
  @ViewChild('tooltipContainer') tooltipContainer: ElementRef<HTMLDivElement>;

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
        this.eventLogChanged();
      }
    });

    this.sharedDataService.correctTreeSyntax$.subscribe(res => {
      this.correctTreeSyntax = res;
    });

    this.sharedDataService.currentDisplayedProcessTree$.subscribe(tree => {
      this.currentlyDisplayedProcessTree = tree;
      const treeHasChanged = !this.sharedDataService.processTreesEqual(this.usedTreeForConformanceChecking,
        this.currentlyDisplayedProcessTree);

      if (treeHasChanged) {
        this.outdatedConformanceStatistics = true;
        this.variants.forEach(v => v.isAddedFittingVariant = false);
      }
    });
  }

  ngAfterContentChecked(): void {
    this.tooltipActivationService.initialize();
  }

  ngAfterViewInit() {
    this.polygonDrawingService.setElementRefereneces(this.variantExplorerContainer,
      this.tooltipContainer);

    this._goldenLayoutHostComponent =  this.goldenLayoutComponentService.goldenLayoutHostComponent;
    this._goldenLayout =  this.goldenLayoutComponentService.goldenLayout;
    console.log(this._goldenLayoutHostComponent);
    console.log(this._goldenLayout);
  }


  private eventLogChanged(): void {
    this.colorMap = this.colorMapService.getColorMap(Object.keys(this.sharedDataService.activitiesInEventLog));

    this.variants = this.sharedDataService.variants;
    this.initializeVisibleVariants();

    this.variants.forEach(v => {
      v.isSelected = false;
      v.isAddedFittingVariant = false;
    });

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

  createSubVariantView(index){

    const LocationSelectors: LayoutManager.LocationSelector[] = [
      { typeId: LayoutManager.LocationSelector.TypeId.FocusedStack, index: undefined },
    ];

    const componentitemRef = this._goldenLayout.findFirstComponentItemById(SubvariantExplorerComponent.componentName + (index - 1))

      // If the Component was found, put it into focus
    if(componentitemRef !== undefined){
      componentitemRef.focus();

      // Instantiate a new Subvariant Component for this variant
    } else {

    this._goldenLayout.findFirstComponentItemById(VariantExplorerComponent.componentName).focus()

    const itemConfig : ComponentItemConfig = {
                                               id : SubvariantExplorerComponent.componentName + (index - 1),
                                               type: "component",
                                               title: "Subvariant " + (index),
                                               isClosable: true,
                                               componentState: this.variants[index - 1],
                                               componentType: SubvariantExplorerComponent.componentName,
                                             }

    const itemConfigItem = this._goldenLayout.addItemAtLocation(itemConfig, LocationSelectors)

    }

  }

  updateAlignments(): void {
    if (!this.outdatedConformanceStatistics) {
      return;
    }

    let calculatedAlignments = 0;
    this.tooltipActivationService.close();
    this.alignmentCalculationInProgress = true;

    this.updateAlignmentStatistics();

    this.variants.forEach(v => {
      v.calculationInProgress = true;
      v.deviation = undefined;

      this.backendService.calculateAlignmentsCVariant(v.variant).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
        v.calculationInProgress = false;
        v.alignment = res.alignment;
        v.deviation = res.deviation;
        calculatedAlignments++;
        this.updateAlignmentStatistics();
        if (calculatedAlignments === this.totalNumberVariants) {
          this.alignmentCalculationInProgress = false;
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


    const variants = this.getSelectedVariants().map(v => v.variant);

    this.backendService.discoverProcessModelFromConcurrencyVariants(variants).subscribe(_ =>
      this.refreshConformanceIconsAfterModelChange(true));
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

  selectionChangedForVariant(variant: Variant, isSelected: boolean): void {
    variant.isSelected = isSelected;
  }

  addSelectedVariantsToModel(): void {
    this.tooltipActivationService.close();

    // TODO we currently distinguish two cases here: 1. outdated conformance and 2. known conformance
    // in the future, we want to use caching in the backend and use only a single call from frontend
    if (this.outdatedConformanceStatistics) {
      this.addSelectedVariantsToModelForOutdatedConformance();
      return;
    }

    this.addSelectedVariantsToModelForGivenConformance();
  }

  getSelectedVariants(): Variant[] {
    return this.variants.filter(v => v.isSelected);
  }

  addSelectedVariantsToModelForOutdatedConformance(): void {
    const selectedVariants = this.getSelectedVariants().map(v => v.variant);

    this.backendService.addConcurrencyVariantsToProcessModelForUnknownConformance(selectedVariants)
      .subscribe(_ => {
        this.refreshConformanceIconsAfterModelChange(false);
      });
  }

  addSelectedVariantsToModelForGivenConformance(): void {
    const selectedVariants = this.getSelectedVariants();
    const fittingVariants = selectedVariants.filter(v => !v.deviation).map(v => v.variant);
    const variantsToAdd = selectedVariants.filter(v => v.deviation).map(v => v.variant);

    this.backendService.addConcurrencyVariantsToProcessModel(variantsToAdd, fittingVariants)
      .subscribe(_ => {
        this.refreshConformanceIconsAfterModelChange(false);
      });
  }

  refreshConformanceIconsAfterModelChange(wasInitialDiscovery: boolean): void {
    if (wasInitialDiscovery) {
      this.variants.forEach(v => {
        v.deviation = undefined;
        v.calculationInProgress = false;
      });
    }

    this.getSelectedVariants().forEach(v => {
      v.isAddedFittingVariant = true;
      v.deviation = false;
      v.calculationInProgress = false;
    });
  }

  isAnyVariantSelected(): boolean {
    return this.variants.some(v => v.isSelected);
  }

  isNoVariantSelected(): boolean {
    return !this.isAnyVariantSelected();
  }

  areAllVariantsSelected(): boolean {
    return this.getSelectedVariants().length >= this.totalNumberVariants;
  }

  unSelectAllChanged(isSelected: boolean): void {
    this.tooltipActivationService.close();
    this.variants.forEach(v => v.isSelected = isSelected)
  }

  areAllVariantsExpanded(): boolean {
    if (this.variantComponents === undefined) {
      return false;
    }
    const unexpandedVariantsExist = this.variantComponents.some(c => !c.isExpanded());
    return !unexpandedVariantsExist;
  }

  unExpandAll(shouldExpand: boolean): void {
    this.tooltipActivationService.close();
    this.variantComponents.forEach(c => c.setExpanded(shouldExpand));
  }

  onScroll(event): void {
    const scrollTop = event.target.scrollTop;
    this.updateVisible(scrollTop);
  }

  handleResponsiveChange(left: number, top: number, width: number, height: number) : void{
    if (width < 600){
      this.collapse = true;
    }else{
      this.collapse = false;
    }
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

  // TODO isComplexVariant is currently unused
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

  exportVariantSVG() {
    let svgs: SVGGraphicsElement[] = [];
    let state: boolean[] = [];

    this.svgRenderingInProgress = true;

    // Get current expansion state
    this.variantComponents.forEach(c => state.push(c.isExpanded()));

    // Expand the elements and redraw them
    this.variantComponents.forEach(c => c.setSelected(true));

    // Collect the SVG and pass them to the SVG Service
    this.variantComponents.forEach(c => svgs.push(c.getSVGGraphicElement()));

    // Add Frequency and Percentage information to the SVG
    svgs = svgs.map((c, i) => this.addVariantInformation(c, this.variants[i].count, this.variants[i].percentage));

    // TODO Create the Legend Element and add it
    const legend = d3.create("svg")
      .attr("x", "10")
      .attr("y", "10");

    let leafnodes: LeafNode[] = [];

    for (let activity in this.sharedDataService.activitiesInEventLog) {
      leafnodes.push(new LeafNode([activity]));
    }

    this.polygonDrawingService.drawLegend(leafnodes, legend, this.colorMap);

    svgs.unshift(legend.node());

    // Send all Elements to the export service
    this.imageExportService.export("variant_explorer", 0, 0, ...svgs);

    // Return everything to its previous state
    this.variantComponents.forEach((c, i) => c.setSelected(state[i]))

    // Hide the Spinner
    this.svgRenderingInProgress = false;
  }

  addVariantInformation(svgElement: SVGGraphicsElement, variantAbs: number, variantPerc: number): SVGGraphicsElement {
    const SHIFTLENGTH: number = 50;

    const svgElement_copy = (svgElement.cloneNode(true) as SVGGraphicsElement);

    // Shift all Elements to the right using by transform chaining
    svgElement_copy.setAttribute("width", (svgElement.clientWidth + SHIFTLENGTH).toString());

    d3.select(svgElement_copy).select("g")
      .selectChildren()
      .each(function (this: SVGGraphicsElement) {
        this.setAttribute("transform", this.getAttribute("transform") ? this.getAttribute("transform") + "," + "translate(50,0)" : "translate(50,0)");
      })
    // Add the Frequency Information
    const textfield = d3.select(svgElement_copy).append('text').attr('transform', `translate(20, ${((svgElement.clientHeight - 25) / 2) + 10})`)
      .attr('height', 20)
      .attr('width', 50)
      .attr('font-size', 9)
      .attr('fill', "black");

    textfield.append('tspan')
      .attr('x', 0)
      .attr('dy', 0)
      .attr('height', 9)
      .attr('fill', 'black')
      .text(variantPerc + '%')

    textfield.append('tspan')
      .attr('x', 0)
      .attr('dy', 10)
      .attr('height', 9)
      .attr('fill', 'black')
      .text('(' + variantAbs + ')');

    return svgElement_copy;
  }

}

export namespace VariantExplorerComponent {
  export const componentName = "VariantExplorerComponent";
}
