import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
} from '@angular/core';
import { LayoutChangeDirective } from 'src/app/directives/layout-change.directive';

@Component({
  selector: 'app-info-box',
  templateUrl: './info-box.component.html',
  styleUrls: ['./info-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoBoxComponent extends LayoutChangeDirective {
  constructor(renderer: Renderer2, elRef: ElementRef) {
    super(elRef.nativeElement, renderer);
  }

  handleResponsiveChange(
    left: number,
    top: number,
    width: number,
    height: number
  ): void {}
}

export namespace InfoBoxComponent {
  export const componentName = 'InfoBoxComponent';
}
