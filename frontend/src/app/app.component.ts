import { element } from 'protractor';
import {AfterViewInit, Component, OnDestroy, ViewChild} from '@angular/core';
import {GoldenLayoutHostComponent} from './components/golden-layout-host/golden-layout-host.component';
import {FooterComponent} from './components/footer/footer.component';
import {SideBarComponent} from './components/side-bar/side-bar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnDestroy{
  title = 'interactive-process-mining-angular-app';
  private _windowResizeListener = () => this.handleWindowResizeEvent();

  @ViewChild('goldenLayoutHost') private _goldenLayoutHostComponent: GoldenLayoutHostComponent;

  // Get a ViewChild on the Footer and Sidebar to adjust scaling accordingly
  @ViewChild('footerComponent') private _footerComponent: FooterComponent;
  @ViewChild('sidebarComponent') private _sideBarComponent : SideBarComponent;

  _footerHeight : number;
  _sideBarWidth : number;

  ngAfterViewInit() {
    globalThis.addEventListener('resize', this._windowResizeListener);
    this._footerHeight = this._footerComponent.element.offsetHeight;
    this._sideBarWidth = this._sideBarComponent.element.offsetWidth;


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
    this._footerHeight = this._footerComponent.element.offsetHeight;
    this._sideBarWidth = this._sideBarComponent.element.offsetWidth;
    this._goldenLayoutHostComponent.setSize(bodyWidth - this._sideBarWidth , height)
  }



}

