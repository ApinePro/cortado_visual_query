import {
  Component,
  ComponentRef,
  ElementRef,
  OnDestroy,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  ComponentContainer,
  GoldenLayout,
  LogicalZIndex,
  ResolvedComponentItemConfig,
} from 'golden-layout';

import { baseLayout } from './LayoutTemplates/golden-layout-cortado-base';
import { LayoutChangeDirective } from '../../directives/layout-change.directive';
import { ProcessTreeEditorComponent } from '../process-tree-editor/process-tree-editor.component';
import { VariantExplorerComponent } from '../variant-explorer/variant-explorer.component';
import { ActivityOverviewComponent } from '../activity-overview/activity-overview.component';
import { GoldenLayoutComponentService } from '../../services/goldenLayoutService/golden-layout-component.service';
import { InfoBoxComponent } from '../info-box/info-box.component';
import { VariantEditorComponent } from '../variant-editor/variant-editor.component';

@Component({
  selector: 'app-golden-layout-host',
  templateUrl: './golden-layout-host.component.html',
  styleUrls: ['./golden-layout-host.component.css'],
})
export class GoldenLayoutHostComponent implements OnDestroy {
  private _goldenLayout: GoldenLayout;
  private _goldenLayoutElement: HTMLElement;
  private _componentRefMap = new Map<
    ComponentContainer,
    ComponentRef<LayoutChangeDirective>
  >();
  private _goldenLayoutBoundingClientRect: DOMRect = new DOMRect();

  private _goldenLayoutBindComponentEventListener = (
    container: ComponentContainer,
    itemConfig: ResolvedComponentItemConfig
  ) => this.handleBindComponentEvent(container, itemConfig);
  private _goldenLayoutUnbindComponentEventListener = (
    container: ComponentContainer
  ) => this.handleUnbindComponentEvent(container);

  @ViewChild('componentViewContainer', { read: ViewContainerRef, static: true })
  private _componentViewContainerRef: ViewContainerRef;

  get goldenLayout() {
    return this._goldenLayout;
  }

  constructor(
    private _elRef: ElementRef<HTMLElement>,
    private goldenLayoutComponentService: GoldenLayoutComponentService
  ) {
    // Get the Layout Host Component
    this._goldenLayoutElement = this._elRef.nativeElement;

    // Register Components to the Layout Template Host
    this.goldenLayoutComponentService.registerComponentType(
      ProcessTreeEditorComponent.componentName,
      ProcessTreeEditorComponent
    );
    this.goldenLayoutComponentService.registerComponentType(
      ActivityOverviewComponent.componentName,
      ActivityOverviewComponent
    );
    this.goldenLayoutComponentService.registerComponentType(
      InfoBoxComponent.componentName,
      InfoBoxComponent
    );
    this.goldenLayoutComponentService.registerComponentType(
      VariantExplorerComponent.componentName,
      VariantExplorerComponent
    );
    this.goldenLayoutComponentService.registerComponentType(
      VariantEditorComponent.componentName,
      VariantEditorComponent
    );

    this._goldenLayout = new GoldenLayout(
      this._goldenLayoutElement,
      this._goldenLayoutBindComponentEventListener,
      this._goldenLayoutUnbindComponentEventListener
    );

    this._goldenLayout.beforeVirtualRectingEvent = () =>
      this.handleBeforeVirtualRectingEvent();

    this.goldenLayoutComponentService.goldenLayout = this._goldenLayout;
  }

  // ngOnInit(){
  //
  // }

  initializeLayout() {
    // Start rendering the Template
    this.goldenLayout.loadLayout(baseLayout);
  }

  ngOnDestroy() {
    this._goldenLayout.destroy();
  }

  setSize(width: number, height: number) {
    this._goldenLayout.setSize(width, height);
  }

  getComponentRef(container: ComponentContainer) {
    return this._componentRefMap.get(container);
  }

  private handleBindComponentEvent(
    container: ComponentContainer,
    itemConfig: ResolvedComponentItemConfig
  ): ComponentContainer.BindableComponent {
    const componentType = itemConfig.componentType;
    const componentRef = this.goldenLayoutComponentService.createComponent(
      componentType,
      container
    );
    const component = componentRef.instance;

    this._componentRefMap.set(container, componentRef);

    container.virtualRectingRequiredEvent = (container, width, height) =>
      this.handleContainerVirtualRectingRequiredEvent(container, width, height);
    container.virtualVisibilityChangeRequiredEvent = (container, visible) =>
      this.handleContainerVisibilityChangeRequiredEvent(container, visible);
    container.virtualZIndexChangeRequiredEvent = (
      container,
      logicalZIndex,
      defaultZIndex
    ) =>
      this.handleContainerVirtualZIndexChangeRequiredEvent(
        container,
        logicalZIndex,
        defaultZIndex
      );

    this._componentViewContainerRef.insert(componentRef.hostView);

    return {
      component,
      virtual: true,
    };
  }

  private handleUnbindComponentEvent(container: ComponentContainer) {
    const componentRef = this._componentRefMap.get(container);
    if (componentRef === undefined) {
      throw new Error('Could not unbind component. Container not found');
    }
    this._componentRefMap.delete(container);

    const hostView = componentRef.hostView;
    const viewRefIndex = this._componentViewContainerRef.indexOf(hostView);
    if (viewRefIndex < 0) {
      throw new Error('Could not unbind component. ViewRef not found');
    }

    this._componentViewContainerRef.remove(viewRefIndex);
    componentRef.destroy();
  }

  private handleBeforeVirtualRectingEvent() {
    this._goldenLayoutBoundingClientRect =
      this._goldenLayoutElement.getBoundingClientRect();
  }

  private handleContainerVirtualRectingRequiredEvent(
    container: ComponentContainer,
    width: number,
    height: number
  ) {
    const containerBoundingClientRect =
      container.element.getBoundingClientRect();
    const left =
      containerBoundingClientRect.left -
      this._goldenLayoutBoundingClientRect.left;
    const top =
      containerBoundingClientRect.top -
      this._goldenLayoutBoundingClientRect.top;

    const componentRef = this._componentRefMap.get(container);
    if (componentRef === undefined) {
      throw new Error(
        'handleContainerVirtualRectingRequiredEvent: ComponentRef not found'
      );
    }

    const component = componentRef.instance;
    component.setPositionAndSize(left, top, width, height);
    component.handleResponsiveChange(left, top, width, height);
  }

  private handleContainerVisibilityChangeRequiredEvent(
    container: ComponentContainer,
    visible: boolean
  ) {
    const componentRef = this._componentRefMap.get(container);
    if (componentRef === undefined) {
      throw new Error(
        'handleContainerVisibilityChangeRequiredEvent: ComponentRef not found'
      );
    }
    const component = componentRef.instance;
    component.setVisibility(visible);
  }

  private handleContainerVirtualZIndexChangeRequiredEvent(
    container: ComponentContainer,
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ) {
    const componentRef = this._componentRefMap.get(container);
    if (componentRef === undefined) {
      throw new Error(
        'handleContainerVirtualZIndexChangeRequiredEvent: ComponentRef not found'
      );
    }
    const component = componentRef.instance;
    component.setZIndex(defaultZIndex);

    if (
      logicalZIndex === 'base' &&
      container.component instanceof VariantExplorerComponent
    ) {
      // Triggers a Redraw, to prevent faulty rendering after minimization
      this.goldenLayout.setSize(
        this.goldenLayout.width + 4,
        this.goldenLayout.height
      );
      this.goldenLayout.setSize(
        this.goldenLayout.width - 4,
        this.goldenLayout.height
      );
    }
  }
}
