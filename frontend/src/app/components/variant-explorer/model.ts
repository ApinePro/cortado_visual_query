import { NumberValue } from 'd3-scale';
import { timeThursdays } from 'd3-time';

export class Constants {
  public static LEAF_WIDTH = 40;
  public static LEAF_WIDTH_EXPANDED = 120;
  public static LEAF_HEIGHT = 23;
  public static MARGIN_X = 8;
  public static MARGIN_Y = 5;
  public static SEQUENCEGROUP_Margin = 15;
  public static ARROW_FEATHER_LENGTH = 10;
  public static ARROW_HEAD_LENGTH = 12;
  public static ARROW_HEAD_ANGLE = 20;
  public static FONT_SIZE = 15;
  public static WAITING_WIDTH = 5;
  public static WAITING_WIDTH_EXPANDED = 10;
  public static CHAR_WIDTH = 12;
  public static MAX_OFFSETWIDTH = 800;
  public static LEGEND_MARGIN_X = 10;
  public static LEGEND_MARGIN_Y = 5;
  public static POINT_RADIUS = 7;
  public static INTERVAL_LENGTH = 60;
}

export class Variant {
  id: string;
  number: number;
  count: number;
  length: number;
  number_of_activities: number;
  variant: VariantElement;
  isSelected: boolean;
  isAddedFittingVariant: boolean;
  percentage: number;
  calculationInProgress: boolean | undefined;
  // TODO alignment is unused it will not be returned by calculateAlignmentsCVariant backend endpoint
  alignment: any | undefined;
  deviation: any | undefined;
  isTimeouted: boolean;
  isConformanceOutdated: boolean;
  sub_variants:
    | {
        count: number;
        variant: [string, string][][];
        percentage: number;
        calculationInProgress: boolean | undefined;
        // TODO alignment is unused it will not be returned by calculateAlignmentsCVariant backend endpoint
        alignment: any | undefined;
        deviation: any | undefined;
      }[]
    | undefined;
}

export abstract class VariantElement {
  public expanded: boolean = false;
  public serviceTime: PerformanceStats;
  public waitingTime: PerformanceStats;
  public waitingTimeStart: PerformanceStats;
  public waitingTimeEnd: PerformanceStats;

  public height;
  width;

  public inspectionMode = false;

  constructor(performance: any = undefined) {
    this.serviceTime = performance?.service_time;
    this.waitingTime = performance?.wait_time;
    this.waitingTimeStart = performance?.wait_time_start;
    this.waitingTimeEnd = performance?.wait_time_end;
  }

  public asSequenceGroup(): SequenceGroup {
    let self: unknown = this;
    return <SequenceGroup>self;
  }

  public asParallelGroup(): ParallelGroup {
    let self: unknown = this;
    return <ParallelGroup>self;
  }

  public asLeafNode(): LeafNode {
    let self: unknown = this;
    return <LeafNode>self;
  }

  public setExpanded(expanded: boolean) {
    this.expanded = expanded;
  }

  public getExpanded(): boolean {
    return this.expanded;
  }

  public getHeadLength() {
    return (
      Math.tan((Constants.ARROW_HEAD_ANGLE / 360) * Math.PI * 2) *
      (this.getHeight() / 2)
    );
  }

  public getMarginX() {
    return Constants.MARGIN_X;
  }

  public getMarginY() {
    return Constants.MARGIN_Y;
  }

  public abstract getHeight(): number;
  public abstract getWidth(includeWaiting): number;

  public abstract recalculateWidth(includeWaiting): number;
  public abstract recalculateHeight(includeWaiting): number;

  public abstract updateWidth(includeWaiting);

  public abstract serialize(): Object;
}

export class SequenceGroup extends VariantElement {
  constructor(public elements: VariantElement[], performance: any = undefined) {
    super(performance);
  }

  public setExpanded(expanded: boolean) {
    super.setExpanded(expanded);

    for (let el of this.elements) {
      el.setExpanded(expanded);
    }
  }

  public getHeight(): number {
    if (this.height) {
      return this.height;
    }
    return this.recalculateHeight();
  }

  public getWidth(includeWaiting = false): number {
    if (this.width) {
      return this.width;
    }
    return this.recalculateWidth(includeWaiting);
  }

  public getServiceTime(): Object {
    throw new Error('Method not implemented.');
  }

  public getWaitingTime(): Object {
    throw new Error('Method not implemented.');
  }

  public updateWidth(includeWaiting) {
    for (let el of this.elements) {
      el.updateWidth(includeWaiting);
    }
  }

  public recalculateHeight(): number {
    this.elements.forEach((el) => (el.height = undefined));
    this.height =
      Math.max(...this.elements.map((el: VariantElement) => el.getHeight())) +
      this.getMarginY() * 2;
    return this.height;
  }

  public recalculateWidth(includeWaiting = false): number {
    this.elements.forEach((el) => (el.width = undefined));
    this.width =
      this.elements
        .filter((el) => !(el instanceof WaitingTimeNode) || includeWaiting)
        .map((el: VariantElement) => el.getWidth(includeWaiting))
        .reduce((a: number, b: number) => a + b) +
      2 * this.getMarginX() +
      this.getHeadLength() -
      this.elements[0].getHeadLength();
    return this.width;
  }

  public serialize(): any {
    return {
      follows: this.elements
        .map((e) => e.serialize())
        .flat()
        .filter((e) => e !== null),
    };
  }
}

export class ParallelGroup extends VariantElement {
  constructor(public elements: VariantElement[], performance: any = undefined) {
    super(performance);
  }

  public setExpanded(expanded: boolean) {
    super.setExpanded(expanded);

    for (let el of this.elements) {
      el.setExpanded(expanded);
    }
  }

  public getHeight(): number {
    if (this.height) {
      return this.height;
    }
    return this.recalculateHeight();
  }

  public getWidth(includeWaiting = false): number {
    if (this.width) {
      return this.width;
    }
    return this.recalculateWidth(includeWaiting);
  }

  public updateWidth(includeWaiting) {
    let headLength = this.getHeadLength();
    for (let el of this.elements) {
      el.width = this.width - Constants.MARGIN_X - 2 * headLength;
    }

    for (let el of this.elements) {
      el.updateWidth(includeWaiting);
    }
  }

  public recalculateHeight(): number {
    this.elements.forEach((el) => (el.height = undefined));
    this.height =
      this.elements
        .map((el: VariantElement) => el.getHeight() + this.getMarginY())
        .reduce((a: number, b: number) => a + b) + Constants.MARGIN_Y;
    return this.height;
  }

  public recalculateWidth(includeWaiting = false): number {
    this.elements.forEach((el) => (el.width = undefined));
    let headLength = this.getHeadLength();
    this.width =
      Math.max(
        ...this.elements
          .filter((el) => !(el instanceof WaitingTimeNode) || includeWaiting)
          .map((el: VariantElement) => el.getWidth(includeWaiting))
      ) +
      Constants.MARGIN_X +
      2 * headLength;
    return this.width;
  }

  public serialize() {
    return {
      parallel: this.elements
        .map((e) => e.serialize())
        .flat()
        .filter((e) => e !== null),
    };
  }
}

export class LeafNode extends VariantElement {
  public textLength: number = 10;

  constructor(public activity: string[], performance: any = undefined) {
    super(performance);
  }

  public getHeight(): number {
    this.height =
      this.activity.length * (Constants.FONT_SIZE + 2 * Constants.MARGIN_Y);
    return this.height;
  }

  public getWidth(full_text_width: boolean = false): number {
    if (this.width) {
      return this.width;
    }
    if (this.expanded) {
      this.width = Constants.LEAF_WIDTH_EXPANDED;
    } else if (full_text_width) {
      this.width = this.activity[0].length * Constants.CHAR_WIDTH;
    } else {
      this.width = Constants.LEAF_WIDTH;
    }
    this.width += Constants.MARGIN_X;

    this.width = Math.max(
      this.width * 0.75 + this.getHeadLength() * 2,
      this.width - this.getHeadLength() * 2
    );

    return this.width;
  }

  public updateWidth() {}

  public recalculateHeight(): number {
    this.height = Constants.LEAF_HEIGHT;
    return this.height;
  }

  public recalculateWidth(): number {
    if (this.expanded) {
      this.width = Constants.LEAF_WIDTH_EXPANDED;
    } else {
      this.width = Constants.LEAF_WIDTH;
    }
    this.width += Constants.MARGIN_X;
    return this.width;
  }

  public serialize() {
    return { leaf: this.activity };
  }
}

export class WaitingTimeNode extends VariantElement {
  constructor(waitingTime: PerformanceStats) {
    super({ wait_time: waitingTime });
  }

  public getHeight(): number {
    return Constants.LEAF_HEIGHT;
  }

  public getWidth(): number {
    if (this.width) {
      return this.width;
    }
    if (this.expanded) {
      this.width = Constants.WAITING_WIDTH_EXPANDED;
    } else {
      this.width = Constants.WAITING_WIDTH;
    }
    this.width += Constants.MARGIN_X;

    return this.width;
  }

  public updateWidth() {}

  public recalculateHeight(): number {
    this.height = Constants.LEAF_HEIGHT;
    return this.height;
  }

  public recalculateWidth(): number {
    if (this.expanded) {
      this.width = Constants.LEAF_WIDTH_EXPANDED;
    } else {
      this.width = Constants.LEAF_WIDTH;
    }
    this.width += Constants.MARGIN_X;
    return this.width;
  }

  public serialize() {
    return null;
  }
}

export class InvisibleSequenceGroup extends SequenceGroup {
  public getMarginX() {
    return 0;
  }

  public getMarginY() {
    return 0;
  }

  public updateWidth(includeWaiting = false) {
    let waiting = includeWaiting ? 1 : 0;
    let waitingLengths = this.elements
      .filter((e) => e instanceof WaitingTimeNode)
      .map((e) => e.getWidth(true))
      .reduce((a, b) => a + b, 0);
    this.elements
      .filter((e) => !(e instanceof WaitingTimeNode))
      .forEach((e) => (e.width = this.width - waitingLengths * waiting));
    return this.width;
  }

  public serialize() {
    return this.elements.map((e) => e.serialize()).filter((e) => e !== null);
  }
}
export function deserialize(obj: any): VariantElement {
  if ('follows' in obj) {
    return new SequenceGroup(
      obj['follows'].map((e: any) => deserialize(e)),
      obj['performance']
    );
  } else if ('parallel' in obj) {
    return new ParallelGroup(
      obj['parallel'].map((e: any) => deserialize(e)),
      obj['performance']
    );
  } else {
    return new LeafNode(obj['leaf'], obj['performance']);
  }
}

export class PerformanceStats {
  public min: number;
  public max: number;
  public mean: number;
  public median: number;
  public stdev: number | undefined = 0;
  public n: number;

  constructor(dict) {
    if (dict) {
      this.min = dict['min'];
      this.max = dict['max'];
      this.mean = dict['mean'];
      this.median = dict['median'];
      this.stdev = dict['stdev'] || 0;
      this.n = dict['n'];
    }
  }
}
