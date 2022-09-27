import { Component, HostBinding, OnInit } from '@angular/core';

@Component({
  selector: 'th[resizeable], resizeable-header',
  templateUrl: './resizeable-table-header.component.html',
  styleUrls: ['./resizeable-table-header.component.scss']
})
export class ResizeableTableHeaderComponent{

  constructor() {
    console.log('Created Resizeable Column')
  }
  @HostBinding('style.width.px')
  width: number | null = null;

  onResize(width: any) {
    this.width = width;
  }

}
