import { SharedDataService } from '../../../services/sharedDataService/shared-data.service';
import { ColorMapService } from '../../../services/colorMapService/color-map.service';
import { Variant } from '../model';
import {
  Component,
  ElementRef,
  Inject,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ComponentContainer } from 'golden-layout';
import { LayoutChangeDirective } from 'src/app/directives/layout-change.directive';
import { VariantComponent } from '../variant/variant.component';
import { SubVariantComponent } from '../sub-variant/sub-variant.component';
import { VariantFragmentComponent } from '../variant-fragment/variant-fragment.component';

@Component({
  selector: 'app-subvariant-explorer',
  templateUrl: './subvariant-explorer.component.html',
  styleUrls: ['./subvariant-explorer.component.css'], // Consider also importing the base style from the normal variant explorer scss
})
export class SubvariantExplorerComponent extends LayoutChangeDirective {
  mainVariant: Variant;
  public colorMap: Map<string, string>;

  @ViewChild(VariantFragmentComponent)
  mainVariantComponent: VariantFragmentComponent;

  @ViewChildren(SubVariantComponent)
  subVariantComponents: QueryList<SubVariantComponent>;

  constructor(
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    elRef: ElementRef,
    renderer: Renderer2,
    private colorMapService: ColorMapService,
    private sharedDataService: SharedDataService
  ) {
    super(elRef.nativeElement, renderer);
    this.mainVariant = this.container.initialState as Variant;
    this.colorMap = this.colorMapService.getColorMap(
      Object.keys(this.sharedDataService.activitiesInEventLog)
    );
  }

  // Implements responsive changes, such as triggering animations, if the layout and thus the components size changes
  handleResponsiveChange(
    left: number,
    top: number,
    width: number,
    height: number
  ): void {}

  public toggleExpanded() {
    let expanded = this.mainVariantComponent.isExpanded();
    this.mainVariantComponent.setExpanded(!expanded);
    this.setExpandedSubVariants(!expanded);
  }

  public setExpandedSubVariants(expanded) {
    this.subVariantComponents.forEach((svc) => svc.setExpanded(expanded));
  }
}

export namespace SubvariantExplorerComponent {
  export const componentName = 'SubvariantExplorerComponent';
}
