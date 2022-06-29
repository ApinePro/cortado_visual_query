import {
  AfterViewInit,
  ApplicationInitStatus,
  APP_INITIALIZER,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { GoldenLayoutHostComponent } from './components/golden-layout-host/golden-layout-host.component';
import { DropZoneDirective } from './directives/drop-zone/drop-zone.directive';
import { GoldenLayoutComponentService } from './services/goldenLayoutService/golden-layout-component.service';
import { LogService } from './services/logService/log.service';
import { SharedDataService } from './services/sharedDataService/shared-data.service';
import * as d3 from 'd3';
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

  constructor(
    private goldenLayoutComponentService: GoldenLayoutComponentService,
    private logService: LogService,
    private sharedDataService: SharedDataService,
    @Inject(APP_INITIALIZER) public appInit: ApplicationInitStatus
  ) {}

  _sideBarWidth: number = 30;

  ngAfterViewInit() {
    globalThis.addEventListener('resize', this._windowResizeListener);
    this._goldenLayoutHostComponent.initializeLayout();
    this.goldenLayoutComponentService.goldenLayoutHostComponent =
      this._goldenLayoutHostComponent;
    setTimeout(() => this.resizeGoldenLayout(), 0);

    this.goldenLayoutComponentService.goldenLayoutHostComponent =
      this._goldenLayoutHostComponent;
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
