import { SharedDataService } from './../../../services/sharedDataService/shared-data.service';
import { ColorMapService } from './../../../services/colorMapService/color-map.service';

import { Variant } from './../model';
import { GoldenLayoutComponentService } from './../../../services/goldenLayoutService/golden-layout-component.service';
import { Component, ElementRef, Inject, OnInit, Renderer2 } from '@angular/core';
import { ComponentContainer } from 'golden-layout';
import { LayoutChangeDirective } from 'src/app/directives/layout-change.directive';

@Component({
  selector: 'app-subvariant-explorer',
  templateUrl: './subvariant-explorer.component.html',
  styleUrls: ['../variant-explorer.component.scss']
})
export class SubvariantExplorerComponent extends LayoutChangeDirective implements OnInit {

  main_variant : Variant;
  visibleVariants;
  public colorMap: Map<string, string>;
  public invisibleVariantsHeight = 50;

  constructor(@Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken) private container: ComponentContainer,
              elRef: ElementRef,
              renderer: Renderer2,
              private colorMapService : ColorMapService,
              private sharedDataService : SharedDataService
             ) {
    super(elRef.nativeElement, renderer);
    this.main_variant = this.container.initialState as Variant;
    console.log(this.main_variant);
    this.colorMap = this.colorMapService.getColorMap(Object.keys(this.sharedDataService.activitiesInEventLog));
  }

  ngOnInit(): void {
    this.visibleVariants = this.main_variant.sub_variants;
    console.log(this.visibleVariants);
  }




}

export namespace SubvariantExplorerComponent {
  export const componentName = "SubvariantExplorerComponent";
}
