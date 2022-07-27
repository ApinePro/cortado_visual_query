import { InfixType } from './infix_selection';
import { VariantElement } from './variant_element';

export class Variant {
  id: string;
  bid: number; //Positive Numbers indicate Log Variants, Negative Number User Variants
  number: number;
  count: number;
  length: number;
  number_of_activities: number;
  variant: VariantElement;
  isSelected: boolean;
  isDisplayed: boolean;
  isAddedFittingVariant: boolean;
  percentage: number;
  calculationInProgress: boolean | undefined;
  userDefined: boolean;
  // TODO alignment is unused it will not be returned by calculateAlignmentsCVariant backend endpoint
  alignment: any | undefined;
  deviation: any | undefined;
  isTimeouted: boolean;
  isConformanceOutdated: boolean;
  nSubVariants: number;
  infixType: InfixType;

  constructor(
    count: number,
    variant: VariantElement,
    isSelected: boolean,
    isDisplayed: boolean,
    isAddedFittingVariant: boolean,
    percentage: number,
    calculationInProgress: boolean | undefined,
    userDefined: boolean,
    isTimeouted: boolean,
    isConformanceOutdated: boolean,
    nSubVariants: number,
    infixType: InfixType = InfixType.NOT_AN_INFIX
  ) {
    this.count = count;
    this.variant = variant;
    this.isSelected = isSelected;
    this.isDisplayed = isDisplayed;
    this.isAddedFittingVariant = isAddedFittingVariant;
    this.percentage = percentage;
    this.calculationInProgress = calculationInProgress;
    this.userDefined = userDefined;
    this.isTimeouted = isTimeouted;
    this.isConformanceOutdated = isConformanceOutdated;
    this.nSubVariants = nSubVariants;
    this.infixType = infixType;
  }
}
