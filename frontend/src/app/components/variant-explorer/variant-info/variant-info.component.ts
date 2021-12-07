import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-variant-info',
  templateUrl: './variant-info.component.html',
  styleUrls: ['./variant-info.component.css']
})
export class VariantInfoComponent {

  @Input()
  outdatedConformanceStatistics: boolean;

  @Input()
  variant;

  @Output()
  public selectionChanged = new EventEmitter<boolean>();
}
