import {ImageExportService} from './../../services/imageExportService/image-export-service';
import { Component, ElementRef, Inject, AfterViewInit, OnInit, QueryList, ViewChild, ViewChildren, Renderer2 } from '@angular/core';
import {ComponentContainer} from 'golden-layout';
import {ColorMapService} from '../../services/colorMapService/color-map.service';
import {SharedDataService} from '../../services/sharedDataService/shared-data.service';
import {BackendService} from '../../services/backendService/backend.service';
import {ActivateTooltipsService} from '../../services/activateTooltipsService/activate-tooltips.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {deserialize, ParallelGroup, SequenceGroup, VariantElement, LeafNode} from './model';
import {VariantFragmentComponent} from './variant-fragment/variant-fragment.component';
import {PolygonDrawingService} from 'src/app/services/polygon-drawing.service';
import * as d3 from 'd3';
import {LayoutChangeDirective} from '../../directives/layout-change.directive';



@Component({
  selector: 'app-variant-explorer',
  templateUrl: './variant-explorer.component.html',
  styleUrls: ['./variant-explorer.component.scss']
})
export class VariantExplorerComponent extends LayoutChangeDirective implements OnInit, AfterViewInit {

  constructor(private colorMapService: ColorMapService,
              private sharedDataService: SharedDataService,
              private backendService: BackendService,
              private imageExportService: ImageExportService,
              private polygonDrawingService: PolygonDrawingService,
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
  public svgRenderingInProgress : boolean = false;


  @ViewChildren(VariantFragmentComponent)
  variantComponents: QueryList<VariantFragmentComponent>;

  @ViewChild('variantExplorer', {static: true})
  variantExplorerDiv: ElementRef<HTMLDivElement>;

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

  ngAfterViewInit(){
    this.polygonDrawingService.setElementRefereneces(this.variantExplorerContainer,
                                                     this.tooltipContainer);
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

  exportVariantSVG(){


  let svgs : SVGGraphicsElement[] = [];
  let state : boolean[] = [];

  this.svgRenderingInProgress = true;

  // Get current expansion state
  this.variantComponents.forEach(c => state.push(c.getExpanded()));

  // Expand the elements and redraw them
  this.variantComponents.forEach(c => c.setSelected(true));

  // Collect the SVG and pass them to the SVG Service
  this.variantComponents.forEach(c => svgs.push(c.getSVGGraphicElement()));

  // Add Frequency and Percentage information to the SVG
  svgs = svgs.map((c,i) => this.addVariantInformation(c, this.variants[i].count, this.variants[i].percentage));

  // TODO Create the Legend Element and add it
  const legend =  d3.create("svg")
                    .attr("x", "10")
                    .attr("y", "10");

  let leafnodes : LeafNode[] = [];

  for(let activity in this.sharedDataService.activitiesInEventLog){
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

  addVariantInformation(svgElement : SVGGraphicsElement, variantAbs : number, variantPerc : number) : SVGGraphicsElement{
  const SHIFTLENGTH: number = 50;

  const svgElement_copy  = (svgElement.cloneNode(true) as SVGGraphicsElement);

  // Shift all Elements to the right using by transform chaining
  svgElement_copy.setAttribute("width", (svgElement.clientWidth + SHIFTLENGTH).toString());

  d3.select(svgElement_copy).select("g")
                            .selectChildren()
                            .each(function(this : SVGGraphicsElement){
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
