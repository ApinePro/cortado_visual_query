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

  @ViewChild('goldenLayoutHost') private _goldenLayoutHostComponent: GoldenLayoutHostComponent; 

  ngAfterViewInit() {
    globalThis.addEventListener('resize', this._windowResizeListener);
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
    const height = document.body.offsetHeight;
    this._goldenLayoutHostComponent.setSize(bodyWidth, height)
  }



}

