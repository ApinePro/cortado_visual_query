import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
  activityColor,
  clickCallback,
  contextMenuCallback,
} from '../../../functions/variant-drawer-callbacks';
import { IVariant } from '../../../../../objects/Variants/variant_interface';
import { VariantViewModeService } from '../../../../../services/viewModeServices/variant-view-mode.service';
import { ArcDiagramDirective } from '../../../../../directives/arc-diagram/arc-diagram.directive';
import { VariantDrawerDirective } from '../../../../../directives/variant-drawer/variant-drawer.directive';
import { Arc, Pair } from '../../../../../directives/arc-diagram/data';
import { FilterParams } from '../../../arc-diagram/filter/filter-params';
import { ArcsViewMode } from '../../../arc-diagram/arcs-view-mode';

@Component({
  selector: 'app-variant-visualisation',
  templateUrl: './variant-visualisation.component.html',
  styleUrls: ['./variant-visualisation.component.css'],
})
export class VariantVisualisationComponent implements OnInit {
  public id: string;
  public bid: number;
  public arcsRenderingInProgress: boolean = false;

  constructor(public variantViewModeService: VariantViewModeService) {}

  ngOnInit() {
    this.id = this.variant.id;
    this.bid = this.variant.bid;
    if (
      Object.keys(this.arcsCache).length != 0 &&
      !(this.bid in this.arcsCache) &&
      this.arcsViewMode == ArcsViewMode.SHOW_ALL
    ) {
      this.arcsRenderingInProgress = true;
    }

    if (
      this.bid in this.arcsCache &&
      this.arcsViewMode !== ArcsViewMode.HIDE_ALL &&
      this.arcDiagram
    ) {
      this.drawArcs();
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
  arcsCache: { [bid: string]: Pair[] };
  @Input()
  arcsViewMode: ArcsViewMode;
  @Input()
  filterParams: FilterParams;

  @ViewChild(ArcDiagramDirective)
  arcDiagram: ArcDiagramDirective;
  @ViewChild(VariantDrawerDirective)
  variantDrawer: VariantDrawerDirective;

  filterArcs(arcs: Arc[], filterParams: FilterParams) {
    return arcs.filter((arc) => {
      let patternSize = new Set(arc.activities).size;
      return (
        patternSize <= filterParams.sizeRange.high &&
        patternSize >= filterParams.sizeRange.low &&
        arc.numberEle <= filterParams.lengthRange.high &&
        arc.numberEle >= filterParams.lengthRange.low &&
        arc.distanceBetweenPairs <= filterParams.distanceRange.high &&
        arc.distanceBetweenPairs >= filterParams.distanceRange.low
      );
    });
  }

  drawArcs(filterParams?: FilterParams) {
    if (!(this.bid in this.arcsCache)) {
      return;
    }
    let { arcs } = this.arcDiagram.parseInput(this.arcsCache[this.bid]);
    if (!filterParams) {
      filterParams = this.filterParams;
    }
    arcs = this.filterArcs(arcs, filterParams);
    this.arcDiagram.draw(this.variantDrawer, arcs);
    this.arcsRenderingInProgress = false;
  }

  protected readonly ArcsViewMode = ArcsViewMode;
}
