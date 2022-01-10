import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Variant } from '../model';

@Component({
  selector: 'app-variant',
  templateUrl: './variant.component.html',
  styleUrls: ['./variant.component.css']
})
export class VariantComponent {
  @Input()
  index: number;

  @Input()
  variant: Variant;

  @Input()
  colorMap: Map<string, string>;

  @Output()
  public selectionChanged = new EventEmitter<boolean>();
}
