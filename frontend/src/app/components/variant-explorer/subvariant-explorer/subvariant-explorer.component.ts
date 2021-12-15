import { SharedDataService } from './../../../services/sharedDataService/shared-data.service';
import { ColorMapService } from './../../../services/colorMapService/color-map.service';

import { Variant } from './../model';
import { Component, ElementRef, Inject, OnInit, Renderer2 } from '@angular/core';
import { ComponentContainer } from 'golden-layout';
import { LayoutChangeDirective } from 'src/app/directives/layout-change.directive';

@Component({
  selector: 'app-subvariant-explorer',
  templateUrl: './subvariant-explorer.component.html',
  styleUrls: ['./subvariant-explorer.component.css'] // Consider also importing the base style from the normal variant explorer scss
})
export class SubvariantExplorerComponent extends LayoutChangeDirective implements OnInit {

  main_variant : Variant;
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
    this.colorMap = this.colorMapService.getColorMap(Object.keys(this.sharedDataService.activitiesInEventLog));
    console.log("New Subvariant window created for Variant: ", this.main_variant);
  }

  ngOnInit(): void {
  }

}

export namespace SubvariantExplorerComponent {
  export const componentName = "SubvariantExplorerComponent";
}
