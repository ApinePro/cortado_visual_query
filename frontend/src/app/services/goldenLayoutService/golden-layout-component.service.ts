import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  ComponentFactoryResolver,
  Injectable,
  Injector,
  StaticProvider,
  Type,
} from '@angular/core';
import {
  ComponentContainer,
  ComponentItemConfig,
  GoldenLayout,
  JsonValue,
  LayoutManager,
} from 'golden-layout';
import { take } from 'rxjs/operators';
import { GoldenLayoutHostComponent } from 'src/app/components/golden-layout-host/golden-layout-host.component';
import { LayoutChangeDirective } from '../../directives/layout-change.directive';

@Injectable({
  providedIn: 'root',
})
export class GoldenLayoutComponentService {
  private _componentTypeMap = new Map<string, Type<LayoutChangeDirective>>();
  private _goldenLayoutHostComponent: GoldenLayoutHostComponent;
  private _goldenLayout: GoldenLayout;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  registerComponentType(
    name: string,
    componentType: Type<LayoutChangeDirective>
  ) {
    this._componentTypeMap.set(name, componentType);
  }

  getRegisteredComponentTypeNames(): string[] {
    const count = this._componentTypeMap.size;
    const result = new Array<string>(count);
    let idx = 0;
    for (let [key, value] of this._componentTypeMap) {
      result[idx++] = key;
    }
    return result;
  }

  set goldenLayout(goldenLayout: GoldenLayout) {
    this._goldenLayout = goldenLayout;
  }

  get goldenLayout() {
    return this._goldenLayout;
  }

  set goldenLayoutHostComponent(
    goldenLayoutHostComponent: GoldenLayoutHostComponent
  ) {
    this._goldenLayoutHostComponent = goldenLayoutHostComponent;
  }

  get goldenLayoutHostComponent() {
    return this._goldenLayoutHostComponent;
  }

  createComponent(
    componentTypeJsonValue: JsonValue,
    container: ComponentContainer
  ) {
    const componentType = this._componentTypeMap.get(
      componentTypeJsonValue as string
    );
    if (componentType === undefined) {
      throw new Error('Unknown component type');
    } else {
      const provider: StaticProvider = {
        provide: LayoutChangeDirective.GoldenLayoutContainerInjectionToken,
        useValue: container,
      };
      const injector = Injector.create({
        providers: [provider],
      });
      const componentFactoryRef =
        this.componentFactoryResolver.resolveComponentFactory<LayoutChangeDirective>(
          componentType
        );
      return componentFactoryRef.create(injector);
    }
  }

  openWindow(
    componentID: string,
    parentContainerID: string,
    LocationSelectors: LayoutManager.LocationSelector[],
    itemConfig: ComponentItemConfig
  ) {
    const editor = this._goldenLayout.findFirstComponentItemById(componentID);

    const createComponent = (
      parentContainerID,
      itemConfig,
      LocationSelectors
    ) => {
      if (parentContainerID) {
        this._goldenLayout
          .findFirstComponentItemById(parentContainerID)
          .focus();
      }

      if (LocationSelectors) {
        this._goldenLayout.addItemAtLocation(itemConfig, LocationSelectors);
      } else {
        this._goldenLayout.addItem(itemConfig);
      }
    };

    // Destroy the split window instance, and register the creation after the semaphor fires TODO carry over the state
    // Issue, when in the Future multiple Editor might exist and can be closed in rapid succesion

    if (editor && componentID === this._splitViewWindow) {
      editor.close();
      this._splitViewWindow = null;
      createComponent(parentContainerID, itemConfig, LocationSelectors);

      // Create the component at the specified selector
    } else if (!editor) {
      createComponent(parentContainerID, itemConfig, LocationSelectors);
    } else {
      editor.focus();
    }
  }

  createBPMNSplitViewWindow(splitParentID, componentID) {


    this._goldenLayout
      .findFirstComponentItemById(this._splitViewWindow)
      ?.close();

    if (this._splitViewWindow === componentID) {
      this._splitViewWindow = null;
    } else {
      this._goldenLayout.findFirstComponentItemById(componentID)?.close();

      const LocationSelectors: LayoutManager.LocationSelector[] = [
        {
          typeId: LayoutManager.LocationSelector.TypeId.FirstRow,
          index: undefined,
        },
      ];

      const itemConfig: ComponentItemConfig = {
        id: componentID,
        type: 'component',
        title: 'BPMN Editor',
        isClosable: true,
        header: {
          show: false,
        },
        componentType: componentID,
      };

      this._goldenLayout.addItemAtLocation(itemConfig, LocationSelectors);
    }
  }
}
