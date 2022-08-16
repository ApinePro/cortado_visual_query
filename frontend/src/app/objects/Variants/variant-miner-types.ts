import { InfixType } from "src/app/objects/Variants/infix_selection";
import { VariantElement } from "src/app/objects/Variants/variant_element";


export class MiningConfig {
  k: number;
  min_sup: number;
  strat: number;
  loop: number;
  algo: number;
  artifical_start: boolean;

  constructor(k, min_sup, strat, loop, algo, art_start) {
    this.k = k;
    this.min_sup = min_sup;
    this.strat = strat;
    this.loop = loop;
    this.algo = algo;
    this.artifical_start = art_start;
  }

  serialize() {
    return {
      k: this.k,
      min_sup: this.min_sup,
      strat: this.strat,
      algo: this.algo,
      loop: this.loop,
      algo_type: 0,
      artifical_start: this.artifical_start,
    };
  }
}

export enum FrequentMiningStrategy {
  TraceTransaction = 1,
  VariantTransaction = 2,
  TraceOccurence = 3,
  VariantOccurence = 4,
}

export enum FrequentMiningCMStrategy {
  ClosedMaximal = 1,
  OnlyMaximal = 2,
}

export enum FrequentMiningAlgorithm {
  ValidTreeMiner = 1,
  ClosedMaximalMiner = 2,
}

export enum VariantSortKey {
  k = 'k',
  index = 'index',
  support = 'support',
  alignment = 'alignment',
  child_parent_confidence = 'child_parent_confidence',
  subpattern_confidence = 'subpattern_confidence',
  cross_support_confidence = 'cross_support_confidence',
  maximal = 'maximal',
  closed = 'closed',
}

export enum VariantFilterKey {
  k = 'k',
  support = 'support',
  index = 'index',
  deviation = 'deviation',
  child_parent_confidence = 'child_parent_confidence',
  subpattern_confidence = 'subpattern_confidence',
  cross_support_confidence = 'cross_support_confidence',
  maximal = 'maximal',
  closed = 'closed',
}

export class SubvariantPattern {
  index: number;
  k: number;
  variant: VariantElement;
  support: number;
  child_parent_confidence: number;
  subpattern_confidence: number;
  cross_support_confidence: number;
  maximal: boolean;
  valid: boolean;
  closed: boolean;
  bids : Set<number>;

  calculationInProgress;
  isConformanceOutdated;
  isTimeouted;
  deviation;
  alignment;

  infixType: InfixType;

  constructor(
    index: number,
    k: number,
    variant: VariantElement,
    support: number,
    child_parent_confidence: number,
    subpattern_confidence: number,
    cross_support_confidence: number,
    maximal: boolean,
    valid: boolean,
    closed: boolean,
    infixType: InfixType,
    bids : Set<number>,
  ) {
    this.index = index;
    this.k = k;
    this.variant = variant;
    this.support = support;
    this.child_parent_confidence = child_parent_confidence;
    this.subpattern_confidence = subpattern_confidence;
    this.cross_support_confidence = cross_support_confidence;
    this.maximal = maximal;
    this.valid = valid;
    this.closed = closed;
    this.infixType = infixType;
    this.bids = bids;
  }
}
