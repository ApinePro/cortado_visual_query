import { SharedDataService } from '../../../services/sharedDataService/shared-data.service';
import { ColorMapService } from '../../../services/colorMapService/color-map.service';
import { Variant, VariantElement } from '../model';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';
import { LayoutChangeDirective } from 'src/app/directives/layout-change.directive';
import { SubVariantComponent } from '../sub-variant/sub-variant.component';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer.directive';
import { ImageExportService } from 'src/app/services/imageExportService/image-export-service';
import { PolygonDrawingService } from 'src/app/services/polygon-drawing.service';
import * as d3 from 'd3';
import { LeafNode } from '../model';
import { BackendService } from 'src/app/services/backendService/backend.service';
import { VariantPerformanceService } from 'src/app/services/variant-performance.service';

@Component({
  selector: 'app-subvariant-explorer',
  templateUrl: './subvariant-explorer.component.html',
  styleUrls: ['./subvariant-explorer.component.css'], // Consider also importing the base style from the normal variant explorer scss
})
export class SubvariantExplorerComponent
  extends LayoutChangeDirective
  implements AfterViewInit, OnInit
{
  mainVariant: Variant;
  subvariants;
  public colorMap: Map<string, string>;
  public serviceTimeColorMap: any;
  public waitingTimeColorMap: any;
  isPerformanceMode: boolean = false;

  @ViewChild(VariantDrawerDirective)
  mainvariantDrawer: VariantDrawerDirective;

  @ViewChildren(SubVariantComponent)
  subVariantComponents: QueryList<SubVariantComponent>;

  public sortAscending: boolean;
  public svgRenderingInProgress: boolean;

  constructor(
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    elRef: ElementRef,
    renderer: Renderer2,
    private colorMapService: ColorMapService,
    private sharedDataService: SharedDataService,
    private imageExportService: ImageExportService,
    private polygonDrawingService: PolygonDrawingService,
    private backendService: BackendService,
    private variantPerformanceService: VariantPerformanceService
  ) {
    super(elRef.nativeElement, renderer);
    this.mainVariant = this.container.initialState as Variant;
    this.colorMap = this.colorMapService.getColorMap(
      Object.keys(this.sharedDataService.activitiesInEventLog)
    );
    this.sortAscending = false;
    this.svgRenderingInProgress = false;
  }

  ngOnInit(): void {
    this.backendService
      .getSubvariantsForVariant(
        this.mainVariant.variant,
        this.sharedDataService.currentTimeGranularity
      )
      .subscribe((r) => {
        this.subvariants = r;
        console.log(this.subvariants[0]);
      });
  }

  ngAfterViewInit() {
    this.colorMapService.colorMap$.subscribe((cMap) => {
      this.colorMap = cMap;
      this.mainvariantDrawer.redraw();
    });

    this.variantPerformanceService.serviceTimeColorMap.subscribe((colorMap) => {
      if (colorMap !== undefined) {
        this.serviceTimeColorMap = colorMap;
        this.mainvariantDrawer.redraw();
      }
    });

    this.variantPerformanceService.waitingTimeColorMap.subscribe((colorMap) => {
      if (colorMap !== undefined) {
        this.waitingTimeColorMap = colorMap;
        this.mainvariantDrawer.redraw();
      }
    });

    this.variantPerformanceService.variantPerformanceMode.subscribe(
      (isPerformanceModeActive) =>
        this.setPerformanceMode(isPerformanceModeActive, false)
    );
  }

  // Implements responsive changes, such as triggering animations, if the layout and thus the components size changes
  handleResponsiveChange(
    left: number,
    top: number,
    width: number,
    height: number
  ): void {}

  handleVisibilityChange(visibility: boolean): void {
    if (visibility && this.mainvariantDrawer) {
      this.mainvariantDrawer.redraw();
      this.subVariantComponents.forEach((svc) => svc.draw());
    }
  }
  handleZIndexChange(
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void {}

  public toggleExpanded() {
    if (this.isPerformanceMode) {
      return;
    }
    let expanded = this.mainvariantDrawer.isExpanded();
    this.mainvariantDrawer.setExpanded(!expanded);
    this.setExpandedSubVariants(!expanded);
  }

  public setExpandedSubVariants(expanded) {
    this.subVariantComponents.forEach((svc) => svc.setExpanded(expanded));
  }

  subvariantClickCallBack = (
    drawer: VariantDrawerDirective,
    element: VariantElement,
    variant: VariantElement
  ) => {
    this.toggleExpanded();
    if (this.isPerformanceMode) {
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
    }
  };

  toggleSortOrder(): void {
    this.sortAscending = !this.sortAscending;
    this.sortSubvariants('count');
  }

  sortSubvariants(sortAttribute: string): void {
    const order = this.sortAscending ? 1 : -1;
    const subvariantSortFunction = (a, b) => {
      if (a[sortAttribute] < b[sortAttribute]) {
        return -order;
      } else if (a[sortAttribute] > b[sortAttribute]) {
        return order;
      } else return order;
    };

    this.subvariants.sort(subvariantSortFunction);
  }

  exportSubvariantSVG(): void {
    // Prepare an array for the svg elements
    let svgs: SVGGraphicsElement[] = [];

    // Temporarily expand all subvariants
    let expanded = this.mainvariantDrawer.isExpanded();
    if (!expanded) {
      this.toggleExpanded();
    }

    // Turn on the rendering spinner
    this.svgRenderingInProgress = true;

    // Add the main variant to the SVG array
    const mainVariantSVG = this.addVariantInformation(
      this.mainvariantDrawer.getSVGGraphicElement(),
      100,
      100,
      true
    );
    svgs.push(mainVariantSVG);

    // Temporarily change text color to black for readability in the svg
    this.subVariantComponents.forEach((svc) => svc.draw('black'));

    // Insert the subvariants svg to the array
    this.subVariantComponents.forEach((svc) =>
      svgs.push(svc.svgElement.nativeElement)
    );

    // Prepare frequency informations of the subvariants
    const counts = [];
    const percentages = [];
    for (let subVariant of this.subvariants) {
      counts.push(subVariant.count);
      percentages.push(subVariant.percentage);
    }

    // Add frequency informations of the subvariants
    // The first svg is the main variant, so index starts from 1
    for (let i = 1; i < svgs.length; i++) {
      svgs[i] = this.addVariantInformation(
        svgs[i],
        counts[i - 1],
        percentages[i - 1],
        false
      );
    }

    // Draw the legend and insert it to the start of the svg array
    const legend = d3.create('svg').attr('x', '10').attr('y', '10');
    let leafnodes: LeafNode[] = [];
    for (let activity in this.sharedDataService.activitiesInEventLog) {
      leafnodes.push(new LeafNode([activity]));
    }
    this.polygonDrawingService.drawLegend(
      leafnodes,
      legend,
      this.colorMap,
      'Subvariants'
    );
    svgs.unshift(legend.node());

    // Export to an SVG file
    this.imageExportService.export(
      `subvariants-for-${this.mainVariant.number}`,
      0,
      0,
      ...svgs
    );

    // Reset everything back to normal
    if (!expanded) {
      this.toggleExpanded();
    }
    this.subVariantComponents.forEach((svc) => svc.draw('whitesmoke'));

    // Turn off the spinner
    this.svgRenderingInProgress = false;
  }

  addVariantInformation(
    svgElement: any,
    variantAbs: number,
    variantPerc: number,
    mainVariant: boolean = false
  ): SVGGraphicsElement {
    const exportMarginX: number = 80;
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
      .selectChildren()
      .each(function (this: SVGGraphicsElement) {
        this.setAttribute(
          'transform',
          (this.getAttribute('transform')
            ? this.getAttribute('transform') + ','
            : '') + `translate(${exportMarginX}, 0)`
        );
      });

    // Add text field to the left of the variants
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

    if (!mainVariant) {
      // If the variant is not the main variant, then add frequency informations
      textfield
        .append('tspan')
        .attr('x', 0)
        .attr('dy', -7)
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
    } else {
      // If the variant is the main variant, add an indicating text next to it
      textfield
        .append('tspan')
        .attr('x', 0)
        .attr('dy', 8)
        .attr('height', 9)
        .attr('fill', 'black')
        .attr('font-size', 14)
        .text('Parent');
    }
    return svgElement_copy;
  }

  public setPerformanceMode(
    performanceMode: boolean,
    forwardUpdate: boolean = true
  ) {
    this.isPerformanceMode = performanceMode;

    if (forwardUpdate) {
      this.variantPerformanceService.variantPerformanceMode.next(
        performanceMode
      );
    }

    if (performanceMode) {
      this.mainvariantDrawer.setExpanded(true);
      this.setExpandedSubVariants(true);
    }
  }

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

      if (element.serviceTime?.mean !== undefined && this.isPerformanceMode) {
        let stat = this.variantPerformanceService.serviceTimeStatistic;
        color = this.serviceTimeColorMap(element.serviceTime[stat]);
        if (color == undefined) {
          color = '#d3d3d3'; // lightgrey
        }
      } else if (this.isPerformanceMode && variant.variant?.serviceTime) {
        color = '#d3d3d3';
      }
    } else {
      if (this.isPerformanceMode && element.waitingTime?.mean !== undefined) {
        let stat = this.variantPerformanceService.waitingTimeStatistic;
        color = this.waitingTimeColorMap(element.waitingTime[stat]);
      }
    }

    if (!color) {
      color = '#d3d3d3'; // lightgrey
    }

    return color;
  };
}

export namespace SubvariantExplorerComponent {
  export const componentName = 'SubvariantExplorerComponent';
}
