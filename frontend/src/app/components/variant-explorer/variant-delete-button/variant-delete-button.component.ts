import { Component, Input } from '@angular/core';
import { VariantElement } from 'src/app/objects/Variants/variant_element';
import { VariantService } from 'src/app/services/variantService/variant.service';

@Component({
  selector: 'app-variant-delete-button',
  templateUrl: './variant-delete-button.component.html',
  styleUrls: ['./variant-delete-button.component.css'],
})
export class VariantDeleteButtonComponent {
  @Input()
  private variant: VariantElement;

  constructor(private variantService: VariantService) {}

  deleteVariant() {
    const bids = this.variantService.variants
      .filter((v) => v.variant === this.variant)
      .map((v) => v.bid);

    this.variantService.deleteVariants(bids);
  }
}
