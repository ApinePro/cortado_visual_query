import { Component } from '@angular/core';

@Component({
  selector: 'app-variant-delete-button',
  templateUrl: './variant-delete-button.component.html',
  styleUrls: ['./variant-delete-button.component.css'],
})
export class VariantDeleteButtonComponent {
  deleteVariant() {
    console.log('delete variant');
  }
}
