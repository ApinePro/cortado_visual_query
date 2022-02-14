import {
  AfterViewInit,
  Component,
  HostListener,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { GoldenLayoutHostComponent } from './components/golden-layout-host/golden-layout-host.component';
import { DropZoneDirective } from './directives/drop-zone/drop-zone.directive';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit, OnDestroy {
  title = 'interactive-process-mining-angular-app';

  @ViewChild('goldenLayoutHost')
  private _goldenLayoutHostComponent: GoldenLayoutHostComponent;

  private _windowResizeListener = () => this.handleWindowResizeEvent();

  constructor() {}

  ngAfterViewInit() {
    globalThis.addEventListener('resize', this._windowResizeListener);
    this._goldenLayoutHostComponent.initializeLayout();
    setTimeout(() => this.resizeGoldenLayout(), 0);
  }

  // Put the dropzone in front if a File Drag enters
  @HostListener('window:dragenter', ['$event'])
  window_dragenter(event) {
    DropZoneDirective.windowDrag = true;
  }

  // If the File Drag leaves the window, put the Dropzone back again
  @HostListener('window:dragleave', ['$event'])
  window_dragleave(event: DragEvent) {
    if (event.screenX === 0 && event.screenY === 0) {
      DropZoneDirective.windowDrag = false;
    }
  }

  ngOnDestroy() {
    globalThis.removeEventListener('resize', this._windowResizeListener);
  }

  private handleWindowResizeEvent() {
    this.resizeGoldenLayout();
  }

  private resizeGoldenLayout() {
    const bodyWidth = document.body.offsetWidth;
    const bodyHeight = document.body.offsetHeight;
    this._goldenLayoutHostComponent.setSize(bodyWidth, bodyHeight);
  }
}
