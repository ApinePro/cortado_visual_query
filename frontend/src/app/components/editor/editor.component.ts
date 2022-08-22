import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, Renderer2 } from '@angular/core';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';
import { LayoutChangeDirective } from 'src/app/directives/layout-change/layout-change.directive';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent extends LayoutChangeDirective
implements OnInit
{

constructor(
  private ref: ChangeDetectorRef,
  @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
  private container: ComponentContainer,
  elRef: ElementRef,
  renderer: Renderer2
) {
  super(elRef.nativeElement, renderer);
  const state = this.container.initialState;
}

ngOnInit(): void {

}

handleResponsiveChange(left: number, top: number, width: number, height: number): void {

}

handleVisibilityChange(visibility: boolean): void {

}

handleZIndexChange(logicalZIndex: LogicalZIndex, defaultZIndex: string): void {

}

}

export namespace EditorComponent {
  export const componentName = 'EditorComponent';
}
