import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-variant-query-info',
  templateUrl: './variant-query-info.component.html',
  styleUrls: ['./variant-query-info.component.scss'],
  animations: [
    trigger('flyInDiv', [
      transition(':enter', [
        style({ opacity: '0', transform: 'translateX(40px)' }),
        animate(
          '150ms 50ms ease-in',
          style({ opacity: '1', transform: 'translateX(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '150ms 50ms ease-in',
          style({ opacity: '0', transform: 'translateX(50px)' })
        ),
      ]),
    ]),
  ],
})
export class VariantQueryInfoComponent {
  constructor() {}

  @Input() showInfo: boolean;
  @Output() showInfoChange = new EventEmitter<boolean>();

  public requestClose() {
    this.showInfo = false;
    this.showInfoChange.emit(false);
  }
}
