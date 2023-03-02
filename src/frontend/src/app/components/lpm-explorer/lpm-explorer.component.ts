import { Component, ElementRef, Inject, Renderer2 } from '@angular/core';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';
import { LayoutChangeDirective } from 'src/app/directives/layout-change/layout-change.directive';

@Component({
  selector: 'app-lpm-explorer',
  templateUrl: './lpm-explorer.component.html',
  styleUrls: ['./lpm-explorer.component.css'],
})
export class LpmExplorerComponent extends LayoutChangeDirective {
  constructor(
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    elRef: ElementRef,
    renderer: Renderer2
  ) {
    super(elRef.nativeElement, renderer);
  }

  handleResponsiveChange(
    left: number,
    top: number,
    width: number,
    height: number
  ): void {}
  handleVisibilityChange(visibility: boolean): void {}
  handleZIndexChange(
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void {}
}

export namespace LpmExplorerComponent {
  export const componentName = 'LpmExplorerComponent';
}
