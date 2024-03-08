import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {activityColor, clickCallback, contextMenuCallback} from "../../../functions/variant-drawer-callbacks";
import {IVariant} from "../../../../../objects/Variants/variant_interface";
import {VariantViewModeService} from "../../../../../services/viewModeServices/variant-view-mode.service";
import {ArcDiagramDirective} from "../../../../../directives/arc-diagram/arc-diagram.directive";
import {VariantDrawerDirective} from "../../../../../directives/variant-drawer/variant-drawer.directive";
import {Arc, Pair} from "../../../../../directives/arc-diagram/data";
import {FilterParams} from "../../../arc-diagram/filter/filter-params";

@Component({
  selector: 'app-variant-visualisation',
  templateUrl: './variant-visualisation.component.html',
  styleUrls: ['./variant-visualisation.component.css']
})
export class VariantVisualisationComponent implements OnInit{

  public id: string;
  public bid: number;
  public arcsRenderingInProgress: boolean = false;
  public hideArcs: boolean = true;

  constructor(public variantViewModeService: VariantViewModeService) {
  }

  ngOnInit() {
    this.id = this.variant.id;
    this.bid = this.variant.bid;
    if(Object.keys(this.arcsCache).length != 0 && !(this.bid in this.arcsCache) && this.isShowingAllArcs) {
      this.arcsRenderingInProgress = true;
    }
  }

  // Define Callbacks
  variantClickCallBack = clickCallback.bind(this);
  openContextCallback = contextMenuCallback.bind(this);
  computeActivityColor = activityColor.bind(this);

  @Input()
  traceInfixSelectionMode: boolean;
  @Input()
  variant: IVariant;
  @Input()
  colorMap: Map<string, string>;
  @Input()
  arcsCache: { [bid: string]: Pair[]};
  @Input()
  isShowingAllArcs: boolean;

  @ViewChild(ArcDiagramDirective)
  arcDiagram: ArcDiagramDirective;
  @ViewChild(VariantDrawerDirective)
  variantDrawer: VariantDrawerDirective;

  filterArcs(arcs: Arc[], filterParams: FilterParams) {
    return arcs.filter((arc)=>{
      let patternSize = new Set(arc.activities).size;
      return patternSize<=filterParams.sizeRange.high && patternSize>=filterParams.sizeRange.low
        && arc.numberEle<=filterParams.lengthRange.high && arc.numberEle>=filterParams.lengthRange.low
        // && !this.containsDisallowedActivities(arc.activities, filterParams)
        && arc.distanceBetweenPairs <= filterParams.distanceRange.high - 1
        && arc.distanceBetweenPairs >= filterParams.distanceRange.low - 1;
    });
  }

  drawArcs(filterBeforeDrawing: boolean = false, filterParams?: FilterParams) {
    if(!(this.bid in this.arcsCache)) {
      return;
    }
    let { arcs, } = this.arcDiagram.parseInput(this.arcsCache[this.bid]);
    if(filterBeforeDrawing && filterParams) {
      arcs = this.filterArcs(arcs, filterParams);
    }
    this.arcDiagram.draw(this.variantDrawer, arcs);
    this.arcsRenderingInProgress = false;
  }

}
