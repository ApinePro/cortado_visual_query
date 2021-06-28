export class Constants {
  public static LEAF_WIDTH = 40;
  public static LEAF_WIDTH_EXPANDED = 200;
  public static LEAF_HEIGHT = 23;
  public static MARGIN_X = 8;
  public static MARGIN_Y = 5;
  public static ARROW_FEATHER_LENGTH = 10;
  public static ARROW_HEAD_LENGTH = 12;
  public static ARROW_HEAD_ANGLE = 20;
  public static FONT_SIZE = 15;
}


export abstract class VariantElement {
  public expanded: boolean = false;  

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

  public getHeadLength() {
    return Math.tan(Constants.ARROW_HEAD_ANGLE / 360 * Math.PI * 2) * (this.getHeight() / 2)
  }

  public abstract getHeight(): number;
  public abstract getWidth(): number;
}

export class SequenceGroup extends VariantElement {
  constructor(public elements: VariantElement[]) {
    super();
  }

  public setExpanded(expanded: boolean) {
    this.expanded = expanded;

    for(let el of this.elements) {
      el.setExpanded(expanded)
    }
  }

  public getHeight(): number {
    return Math.max(...this.elements.map((el: VariantElement) => el.getHeight())) + Constants.MARGIN_Y * 2
  }

  public getWidth(): number {
    return this.elements.map((el: VariantElement) => el.getWidth())
                        .reduce((a: number, b: number) => a + b) + 2 * Constants.MARGIN_X;
  }
}

export class ParallelGroup extends VariantElement {
  constructor(public elements: VariantElement[]) {
    super();
  }

  public setExpanded(expanded: boolean) {
    this.expanded = expanded;

    for(let el of this.elements) {
      el.setExpanded(expanded)
    }
  }

  public getHeight(): number {
    return this.elements.map((el: VariantElement) => el.getHeight() + Constants.MARGIN_Y * 2)
                      .reduce((a: number, b: number) => a + b) - Constants.MARGIN_Y
  }

  public getWidth(): number {
    let headLength = this.getHeadLength();
    return Math.max(...this.elements.map((el: VariantElement) => el.getWidth())) + Constants.MARGIN_X + 2 * headLength;
  }
  
}

export class LeafNode extends VariantElement {

  public textLength: number = 10;

  constructor(public activity: string) {
    super();
  }

  public setExpanded(expanded: boolean) {
    this.expanded = expanded;
  }

  public getHeight(): number {
    return Constants.LEAF_HEIGHT;
  }

  public getWidth(): number {
    let width = 0;
    if(this.expanded) {
      width = Math.max(Constants.LEAF_WIDTH, this.textLength + 10);
    } else {
      width = Constants.LEAF_WIDTH;
    }
    width += Constants.MARGIN_X; 
    return width;
  }
  
}