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
  public static CHAR_WIDTH = 12;
  public static MAX_OFFSETWIDTH = 800;
  public static LEGEND_MARGIN_X = 10;
  public static LEGEND_MARGIN_Y = 5;
}

export class Variant {
  id: string;
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
  sub_variants: {
    count: number
    variant: [string, string][][],
    percentage: number,
    calculationInProgress: boolean | undefined,
    // TODO alignment is unused it will not be returned by calculateAlignmentsCVariant backend endpoint
    alignment: any | undefined,
    deviation: any | undefined
  }[] | undefined;
}


export abstract class VariantElement {
  public expanded: boolean = false;

  public height; width;

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

  public getExpanded() : boolean{
    return this.expanded;
  }

  public getHeadLength() {
    return Math.tan(Constants.ARROW_HEAD_ANGLE / 360 * Math.PI * 2) * (this.getHeight() / 2)
  }

  public abstract getHeight(): number;
  public abstract getWidth(): number;

  public abstract recalculateWidth(): number;
  public abstract recalculateHeight(): number;

  public abstract updateWidth();

  public abstract serialize(): Object;
}

export class SequenceGroup extends VariantElement {
  constructor(public elements: VariantElement[]) {
    super();
  }

  public setExpanded(expanded: boolean) {
    super.setExpanded(expanded);

    for(let el of this.elements) {
      el.setExpanded(expanded)
    }
  }

  public getHeight(): number {
    if(this.height) {
      return this.height;
    }
    return this.recalculateHeight();
  }

  public getWidth(): number {
    if(this.width) {
      return this.width;
    }
    return this.recalculateWidth();
  }

  public updateWidth() {
    for(let el of this.elements) {
      el.updateWidth();
    }
  }

  public recalculateHeight(): number {
    this.elements.forEach(el => el.height = undefined);
    this.height =  Math.max(...this.elements.map((el: VariantElement) => el.getHeight()))
    return this.height;
  }

  public recalculateWidth(): number {
    this.elements.forEach(el => el.width = undefined);
    this.width = this.elements.map((el: VariantElement) => el.getWidth())
                              .reduce((a: number, b: number) => a + b) + 2 * Constants.MARGIN_X + this.getHeadLength() - this.elements[0].getHeadLength();
    return this.width;
  }

  public serialize() {
    return {'follows': this.elements.map(e => e.serialize()) };
  }
}

export class ParallelGroup extends VariantElement {
  constructor(public elements: VariantElement[]) {
    super();
  }

  public setExpanded(expanded: boolean) {
    super.setExpanded(expanded);

    for(let el of this.elements) {
      el.setExpanded(expanded)
    }
  }

  public getHeight(): number {
    if(this.height) {
      return this.height;
    }
    return this.recalculateHeight();
  }

  public getWidth(): number {
    if(this.width) {
      return this.width;
    }
    return this.recalculateWidth();
  }

  public updateWidth() {
    let headLength = this.getHeadLength();
    for(let el of this.elements) {
      el.width = this.width - Constants.MARGIN_X - 2 * headLength;
    }

    for(let el of this.elements) {
      el.updateWidth();
    }
  }

  public recalculateHeight(): number {
    this.elements.forEach(el => el.height = undefined);
    this.height = this.elements.map((el: VariantElement) => el.getHeight() + Constants.MARGIN_Y)
                      .reduce((a: number, b: number) => a + b) + Constants.MARGIN_Y
    return this.height;
  }

  public recalculateWidth(): number {
    this.elements.forEach(el => el.width = undefined);
    let headLength = this.getHeadLength();
    this.width = Math.max(...this.elements.map((el: VariantElement) => el.getWidth())) + Constants.MARGIN_X + 2 * headLength;
    return this.width;
  }

  public serialize() {
    return {'parallel': this.elements.map(e => e.serialize()) };
  }
}

export class LeafNode extends VariantElement {

  public textLength: number = 10;

  constructor(public activity: string[]) {
    super();
  }

  public getHeight(): number {
    this.height = this.activity.length * (Constants.FONT_SIZE + 2 * Constants.MARGIN_Y);
    return this.height;
  }

  public getWidth(full_text_width : boolean = false): number {
    if(this.width) {
      return this.width;
    }
    if(this.expanded) {
      this.width = Constants.LEAF_WIDTH_EXPANDED
    } else if (full_text_width){
      this.width = this.activity[0].length * Constants.CHAR_WIDTH;
    } else {
      this.width = Constants.LEAF_WIDTH;
    }
    this.width += Constants.MARGIN_X;

    this.width = Math.max(this.width * 0.75 + this.getHeadLength() * 2,
                          this.width - this.getHeadLength() * 2)

    return this.width;
  }

  public updateWidth() {};

  public recalculateHeight(): number {
    this.height = Constants.LEAF_HEIGHT;
    return this.height;
  }

  public recalculateWidth(): number {
    if(this.expanded) {
      this.width = Constants.LEAF_WIDTH_EXPANDED
    } else {
      this.width = Constants.LEAF_WIDTH;
    }
    this.width += Constants.MARGIN_X;
    return this.width;
  }

  public serialize() {
    return {'leaf': this.activity };
  }
}

export function deserialize(obj: any): VariantElement {
  if('follows' in obj) {
    return new SequenceGroup(obj['follows'].map((e: any) => deserialize(e)))
  } else if('parallel' in obj) {
    return new ParallelGroup(obj['parallel'].map((e: any) => deserialize(e)))
  } else {
    return new LeafNode(obj['leaf']);
  }
}
