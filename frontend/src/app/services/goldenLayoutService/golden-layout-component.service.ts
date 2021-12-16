import { Observable, Subject } from 'rxjs';
import { ComponentFactoryResolver, Injectable, Injector, StaticProvider, Type } from '@angular/core';
import { ComponentContainer, GoldenLayout, JsonValue } from "golden-layout";
import { GoldenLayoutHostComponent } from 'src/app/components/golden-layout-host/golden-layout-host.component';
import { LayoutChangeDirective } from '../../directives/layout-change.directive';

@Injectable({
  providedIn: 'root'
})
export class GoldenLayoutComponentService {
  private _componentTypeMap = new Map<string, Type<LayoutChangeDirective>>()
  private _goldenLayoutHostComponent: GoldenLayoutHostComponent
  private _goldenLayout: GoldenLayout;
  private _componentDestroyed = new Subject<any>();

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  registerComponentType(name: string, componentType: Type<LayoutChangeDirective>) {
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

  set goldenLayout(goldenLayout : GoldenLayout){
    this._goldenLayout = goldenLayout;
  }

  get goldenLayout(){
    return this._goldenLayout;
  }

  set goldenLayoutHostComponent(goldenLayoutHostComponent : GoldenLayoutHostComponent){
    this._goldenLayoutHostComponent = goldenLayoutHostComponent;
  }

  get goldenLayoutHostComponent(){
    return this._goldenLayoutHostComponent;
  }

  createComponent(componentTypeJsonValue: JsonValue, container: ComponentContainer) {
    const componentType = this._componentTypeMap.get(componentTypeJsonValue as string);
    if (componentType === undefined) {
      throw new Error('Unknown component type')
    } else {
      const provider: StaticProvider = { provide: LayoutChangeDirective.GoldenLayoutContainerInjectionToken, useValue: container };
      const injector = Injector.create({
        providers: [provider]
      });
      const componentFactoryRef = this.componentFactoryResolver.resolveComponentFactory<LayoutChangeDirective>(componentType);
      return componentFactoryRef.create(injector);
    }
  }

}
