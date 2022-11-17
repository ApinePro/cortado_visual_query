import { Variant } from './variant';
import { VariantElement } from './variant_element';

export class LoopCollapsedVariant {
  id: string;
  variants: Variant[];
  variant: VariantElement;
  isDisplayed: boolean;

  constructor(
    id: string,
    variants: Variant[],
    collapsedVariantElement: VariantElement
  ) {
    this.id = id;
    this.variants = variants;
    this.variant = collapsedVariantElement;
  }

  get count() {
    return this.variants.reduce((sum, v) => sum + v.count, 0);
  }

  get isSelected() {
    return this.variants.some((v) => v.isSelected);
  }

  get percentage() {
    return this.variants.reduce((sum, v) => sum + v.percentage, 0);
  }

  get userDefined() {
    return this.variants.some((v) => v.userDefined);
  }

  get nSubVariants() {
    return this.variants.reduce((sum, v) => v.nSubVariants + sum, 0);
  }
}
