import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {activityColor, clickCallback, contextMenuCallback} from "../../../functions/variant-drawer-callbacks";
import {IVariant} from "../../../../../objects/Variants/variant_interface";
import {VariantViewModeService} from "../../../../../services/viewModeServices/variant-view-mode.service";
import {ArcDiagramDirective} from "../../../../../directives/arc-diagram/arc-diagram.directive";
import {VariantDrawerDirective} from "../../../../../directives/variant-drawer/variant-drawer.directive";

@Component({
  selector: 'app-variant-visualisation',
  templateUrl: './variant-visualisation.component.html',
  styleUrls: ['./variant-visualisation.component.css']
})
export class VariantVisualisationComponent implements OnInit{

  public id: string;
  public bid: number;
  public arcsComputed: boolean = false;

  constructor(public variantViewModeService: VariantViewModeService) {
  }

  ngOnInit() {
    this.id = this.variant.id;
    this.bid = this.variant.bid;
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

  @ViewChild(ArcDiagramDirective)
  arcDiagram: ArcDiagramDirective;
  @ViewChild(VariantDrawerDirective)
  variantDrawer: VariantDrawerDirective;
}
