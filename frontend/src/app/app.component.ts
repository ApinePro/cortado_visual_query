import { GoldenLayoutComponentService } from './services/goldenLayoutService/golden-layout-component.service';

import {AfterViewInit, Component, OnDestroy, ViewChild} from '@angular/core';
import {GoldenLayoutHostComponent} from './components/golden-layout-host/golden-layout-host.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnDestroy{
  title = 'interactive-process-mining-angular-app';
  private _windowResizeListener = () => this.handleWindowResizeEvent();

  constructor(private goldenLayoutComponentService : GoldenLayoutComponentService){

  }

  @ViewChild('goldenLayoutHost') private _goldenLayoutHostComponent: GoldenLayoutHostComponent;


  _sideBarWidth : number = 30;

  ngAfterViewInit() {
    globalThis.addEventListener('resize', this._windowResizeListener);
    this._goldenLayoutHostComponent.initializeLayout();
    this.goldenLayoutComponentService.goldenLayoutHostComponent = this._goldenLayoutHostComponent;

    setTimeout(() => this.resizeGoldenLayout(), 0);
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
    this._goldenLayoutHostComponent.setSize(bodyWidth - this._sideBarWidth , bodyHeight)
  }



}

