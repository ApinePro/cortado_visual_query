import { Observable } from "rxjs";

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

  public getHeadLength() {
    return Math.tan(Constants.ARROW_HEAD_ANGLE / 360 * Math.PI * 2) * (this.getHeight() / 2)
  }

  public abstract getHeight(): number;
  public abstract getWidth(): number;

  public abstract recalculateWidth(): number;
  public abstract recalculateHeight(): number;

  public abstract updateWidth();
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
    this.height =  Math.max(...this.elements.map((el: VariantElement) => el.getHeight())) + Constants.MARGIN_Y * 2
    return this.height;
  }

  public recalculateWidth(): number {
    this.elements.forEach(el => el.width = undefined);
    this.width = this.elements.map((el: VariantElement) => el.getWidth())
                              .reduce((a: number, b: number) => a + b) + 2 * Constants.MARGIN_X;
    return this.width;  
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
    this.height = this.elements.map((el: VariantElement) => el.getHeight() + Constants.MARGIN_Y * 2)
                      .reduce((a: number, b: number) => a + b) - Constants.MARGIN_Y
    return this.height;
  }

  public recalculateWidth(): number {
    this.elements.forEach(el => el.width = undefined);
    let headLength = this.getHeadLength();
    this.width = Math.max(...this.elements.map((el: VariantElement) => el.getWidth())) + Constants.MARGIN_X + 2 * headLength;
    return this.width;
  }
}

export class LeafNode extends VariantElement {

  public textLength: number = 10;

  constructor(public activity: string) {
    super();
  }

  public getHeight(): number {
    this.height = Constants.LEAF_HEIGHT;
    return this.height;
  }

  public getWidth(): number {
    if(this.width) {
      return this.width;
    }
    if(this.expanded) {
      this.width = Math.max(Constants.LEAF_WIDTH, this.textLength + 10);
    } else {
      this.width = Constants.LEAF_WIDTH;
    }
    this.width += Constants.MARGIN_X; 
    return this.width;
  }

  public updateWidth() {};  

  public recalculateHeight(): number {
    this.height = Constants.LEAF_HEIGHT;
    return this.height;
  }

  public recalculateWidth(): number {
    if(this.expanded) {
      this.width = Math.max(Constants.LEAF_WIDTH, this.textLength + 10);
    } else {
      this.width = Constants.LEAF_WIDTH;
    }
    this.width += Constants.MARGIN_X; 
    return this.width;
  }
}