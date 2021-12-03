import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-variant-selection-button',
  templateUrl: './variant-selection-button.component.html',
  styleUrls: ['./variant-selection-button.component.css']
})
export class VariantSelectionButtonComponent {

  @Input()
  isSelected: boolean;

  @Input()
  selectTooltipText: boolean;

  @Input()
  unselectTooltipText: boolean;

  @Output()
  public selectionChanged = new EventEmitter<boolean>();
}
