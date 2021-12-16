import {Component, EventEmitter, Input, Output} from '@angular/core';
import { Variant } from '../model';

@Component({
  selector: 'app-variant-info',
  templateUrl: './variant-info.component.html',
  styleUrls: ['./variant-info.component.css']
})
export class VariantInfoComponent {
  @Input()
  variant: Variant;


}
