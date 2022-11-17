import { ProcessTree } from '../ProcessTree/ProcessTree';
import { InfixType } from './infix_selection';
import { Variant } from './variant';
import { VariantElement } from './variant_element';
import { IVariant } from './variant_interface';

export class LoopCollapsedVariant implements IVariant {
  id: string;
  variants: Variant[];
  variant: VariantElement;
  isDisplayed: boolean;
  isAddedFittingVariant: boolean;
  calculationInProgress: boolean;
  alignment: VariantElement;
  deviations: number;
  isTimeouted: boolean;
  isConformanceOutdated: boolean = true;
  usedTreeForConformanceChecking: ProcessTree;
  infixType: InfixType = InfixType.NOT_AN_INFIX;
  fragmentStatistics: any;
  collapsedVariantId: string;

  constructor(
    id: string,
    variants: Variant[],
    collapsedVariantElement: VariantElement
  ) {
    this.id = id;
    this.variants = variants;
    this.variant = collapsedVariantElement;
  }

  get bid() {
    return -1;
  }

  get length() {
    // TODO not correct
    return Math.min(...this.variants.map((v) => v.length));
  }

  get number_of_activities() {
    return this.variants[0].number_of_activities;
  }

  get count() {
    return this.variants.reduce((sum, v) => sum + v.count, 0);
  }

  get isSelected() {
    return this.variants.some((v) => v.isSelected);
  }

  set isSelected(isSelected: boolean) {
    this.variants.forEach((v) => (v.isSelected = isSelected));
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
