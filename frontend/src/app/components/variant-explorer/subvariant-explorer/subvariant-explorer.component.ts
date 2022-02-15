import { SharedDataService } from '../../../services/sharedDataService/shared-data.service';
import { ColorMapService } from '../../../services/colorMapService/color-map.service';
import { Variant, VariantElement } from '../model';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';
import { LayoutChangeDirective } from 'src/app/directives/layout-change.directive';
import { SubVariantComponent } from '../sub-variant/sub-variant.component';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer.directive';

@Component({
  selector: 'app-subvariant-explorer',
  templateUrl: './subvariant-explorer.component.html',
  styleUrls: ['./subvariant-explorer.component.css'], // Consider also importing the base style from the normal variant explorer scss
})
export class SubvariantExplorerComponent
  extends LayoutChangeDirective
  implements AfterViewInit
{
  mainVariant: Variant;
  public colorMap: Map<string, string>;

  @ViewChild(VariantDrawerDirective)
  mainvariantDrawer: VariantDrawerDirective;

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

  ngAfterViewInit() {
    this.colorMapService.colorMap$.subscribe((cMap) => {
      this.colorMap = cMap;
      this.mainvariantDrawer.redraw();
      this.subVariantComponents.forEach((svc) => svc.draw());
    });
  }

  // Implements responsive changes, such as triggering animations, if the layout and thus the components size changes
  handleResponsiveChange(
    left: number,
    top: number,
    width: number,
    height: number
  ): void {}

  handleVisibilityChange(visibility: boolean): void {
    if (visibility) {
      this.mainvariantDrawer.redraw();
      this.subVariantComponents.forEach((svc) => svc.draw());
    }
  }
  handleZIndexChange(
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void {}

  public toggleExpanded() {
    let expanded = this.mainvariantDrawer.isExpanded();
    this.mainvariantDrawer.setExpanded(!expanded);
    this.setExpandedSubVariants(!expanded);
  }

  public setExpandedSubVariants(expanded) {
    this.subVariantComponents.forEach((svc) => svc.setExpanded(expanded));
  }

  computeActivityColor = (
    self: VariantDrawerDirective,
    element: VariantElement,
    variant: Variant
  ) => {
    let color;
    color = this.colorMap.get(element.asLeafNode().activity[0]);

    if (!color) {
      color = '#d3d3d3'; // lightgrey
    }

    return color;
  };

  subvariantClickCallBack = (
    self: VariantDrawerDirective,
    element: VariantElement,
    variant: VariantElement
  ) => {
    this.toggleExpanded();
  };
}

export namespace SubvariantExplorerComponent {
  export const componentName = 'SubvariantExplorerComponent';
}
