export const isElementWithActivity = (elem: VariantElement) => {
  if (
    elem instanceof ParallelGroup ||
    elem instanceof SequenceGroup ||
    elem instanceof LeafNode
  ) {
    return true;
  } else {
    return false;
  }
};

const areAllChildrenSelected = (elem: VariantElement) => {
  if (elem instanceof LeafNode) {
    return elem.selected;
  }

  if (elem instanceof ParallelGroup || elem instanceof SequenceGroup) {
    for (let e of elem.elements) {
      if (!isElementWithActivity(e)) {
        continue;
      }
      if (!areAllChildrenSelected(e)) {
        return false;
      }
    }

    return true;
  } else {
    // Waiting Time Node, etc...
    return true;
  }
};

const updateSelectionAttributesForGroup = (group: any) => {
  updateSelectedAttributesForGroup(group);
  updateSelectableAttributesForGroup(group);
};

const updateSelectedAttributesForGroup = (group: any) => {
  let children = group.elements.filter((c) => isElementWithActivity(c));

  let allChildrenSelected: boolean = true;

  for (let child of children) {
    child.selected = areAllChildrenSelected(child);
    allChildrenSelected = allChildrenSelected && child.selected;
  }

  if (allChildrenSelected) {
    group.selected = true;
  }

  for (let child of children) {
    if (!(child instanceof LeafNode)) {
      updateSelectedAttributesForGroup(child);
    }
  }
};

const updateSelectableAttributesForGroup = (group: any) => {
  let children = group.elements.filter((c) => isElementWithActivity(c));

  let nothingIsSelected = !someChildrenSelected(group);

  if (nothingIsSelected) {
    group.setSelectable(true);
    group.setNotUnselectable();
    return;
  }

  // initialize all elements with not selectable state
  for (let child of children) {
    child.setNotSelectable();
    child.setNotUnselectable();
  }

  // First, check if a child is only partly selected
  // If yes, set all other children to be not selectable and call this function on that child
  for (let child of children) {
    let childIsCompletelySelected: boolean = child.selected;
    if (childIsCompletelySelected || !someChildrenSelected(child)) {
      continue;
    }

    if (someChildrenSelected(child)) {
      child.setSelectable();
      updateSelectableAttributesForGroup(child);
      return;
    }
  }

  group.updateSurroundingSelectableElements();
};

export const someChildrenSelected = (elem: VariantElement) => {
  if (elem instanceof LeafNode) {
    return elem.selected;
  } else if (elem instanceof ParallelGroup || elem instanceof SequenceGroup) {
    for (let child of elem.elements) {
      if (!isElementWithActivity(child)) {
        continue;
      }
      if (someChildrenSelected(child)) {
        return true;
      }
    }

    return false;
  } else {
    // Waiting Time Node, etc...
    return false;
  }
};

export const setParent = (root: VariantElement) => {
  if (root instanceof ParallelGroup || root instanceof SequenceGroup) {
    for (let child of root.elements) {
      child['parent'] = root;
      setParent(child);
    }
  }
};

export const getLowestSelectionActionableElement = (elem: VariantElement) => {
  if (elem.selectable || elem.unselectable || elem.parent == null) {
    // Selectable or unselectable or root
    return elem;
  } else {
    return getLowestSelectionActionableElement(elem.parent);
  }
};

export const getSelectedChildren = (elem: VariantElement) => {
  if (elem instanceof LeafNode && elem.selected) {
    let ret = elem.copy();
    ret.selected = false;
    ret.selectable = true;
    return ret;
  } else if (elem instanceof SequenceGroup || elem instanceof ParallelGroup) {
    let copyElem;
    if (elem instanceof SequenceGroup) {
      copyElem = new SequenceGroup([]);
    } else if (elem instanceof ParallelGroup) {
      copyElem = new ParallelGroup([]);
    }
    copyElem.selected = false;
    copyElem.selectable = true;
    for (let child of elem.elements) {
      if (!(child instanceof WaitingTimeNode) && someChildrenSelected(child)) {
        let newPushedChild;
        if (!(child instanceof InvisibleSequenceGroup)) {
          newPushedChild = child;
        } else {
          newPushedChild = child.elements[1]; // InvisibleSequenceGroup has one leaf child at this position
        }
        copyElem.elements.push(getSelectedChildren(newPushedChild));
      }
    }
    setParent(copyElem);
    return copyElem;
  }
};

// Sometimes selecting trace infix creates variant elements with only one child on many tree levels
// The following function fixes the problem by reducing tree levels
export const removeIntermediateGroupsWithSingleElements = (
  elem: VariantElement
) => {
  if (elem instanceof LeafNode) {
    return elem;
  } else if (elem instanceof SequenceGroup || elem instanceof ParallelGroup) {
    if (elem.elements.length == 1) {
      let onlyChild = removeIntermediateGroupsWithSingleElements(
        elem.elements[0]
      );
      return onlyChild;
    } else {
      let newChildren = elem.elements.map(
        removeIntermediateGroupsWithSingleElements
      );
      elem.setElements(newChildren);
      return elem;
    }
  }
};

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

export enum InfixType {
  PROPER_INFIX = 1,
  PREFIX = 2,
  POSTFIX = 3,
  NOT_AN_INFIX = 4,
}

export class Variant {
  id: string;
  bid: number;
  number: number;
  count: number;
  length: number;
  number_of_activities: number;
  variant: VariantElement;
  isSelected: boolean;
  isAddedFittingVariant: boolean;
  percentage: number;
  calculationInProgress: boolean | undefined;
  userDefined: boolean;
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
  infixType: InfixType;

  constructor(
    count: number,
    variant: VariantElement,
    isSelected: boolean,
    isAddedFittingVariant: boolean,
    percentage: number,
    calculationInProgress: boolean | undefined,
    userDefined: boolean,
    isTimeouted: boolean,
    isConformanceOutdated: boolean,
    sub_variants,
    infixType: InfixType = InfixType.NOT_AN_INFIX
  ) {
    this.count = count;
    this.variant = variant;
    this.isSelected = isSelected;
    this.isAddedFittingVariant = isAddedFittingVariant;
    this.percentage = percentage;
    this.calculationInProgress = calculationInProgress;
    this.userDefined = userDefined;
    this.isTimeouted = isTimeouted;
    this.isConformanceOutdated = isConformanceOutdated;
    this.sub_variants = sub_variants;
    this.infixType = infixType;
  }
}

export abstract class VariantElement {
  public expanded: boolean = false;
  public serviceTime: PerformanceStats;
  public waitingTime: PerformanceStats;
  public waitingTimeStart: PerformanceStats;
  public waitingTimeEnd: PerformanceStats;
  public selected: boolean = false;
  public selectable: boolean = true;
  public unselectable: boolean = false;

  public height;
  width;

  public inspectionMode = false;

  public parent;

  constructor(performance: any = undefined) {
    this.serviceTime = performance?.service_time;
    this.waitingTime = performance?.wait_time;
    this.waitingTimeStart = performance?.wait_time_start;
    this.waitingTimeEnd = performance?.wait_time_end;
    this.parent = null;
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

  // Creates a deep copy of a Variant Element
  public copy(): VariantElement {
    if (this instanceof ParallelGroup) {
      return this.asParallelGroup().copy();
    } else if (this instanceof SequenceGroup) {
      return this.asSequenceGroup().copy();
    } else {
      return this.asLeafNode().copy();
    }
  }

  public getElements() {
    if (this instanceof ParallelGroup) {
      return this.asParallelGroup().getElements();
    } else if (this instanceof SequenceGroup) {
      return this.asSequenceGroup().getElements();
    } else {
      return null;
    }
  }

  public setElements(children: VariantElement[]) {
    if (this instanceof ParallelGroup) {
      this.asParallelGroup().setElements(children);
      setParent(this);
    } else if (this instanceof SequenceGroup) {
      this.asSequenceGroup().setElements(children);
      setParent(this);
    }
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

  public abstract updateSelectionAttributes(): void;

  public setSelectable(recursive: boolean = false): void {
    this.selectable = true;
    if (
      recursive &&
      (this instanceof ParallelGroup || this instanceof SequenceGroup)
    ) {
      for (let elem of this.elements) {
        elem.setSelectable(recursive);
      }
    }
  }

  public setNotSelectable(): void {
    this.selectable = false;
    if (this instanceof ParallelGroup || this instanceof SequenceGroup) {
      for (let elem of this.elements) {
        elem.setNotSelectable();
      }
    }
  }

  public setNotUnselectable(): void {
    this.unselectable = false;
    if (this instanceof ParallelGroup || this instanceof SequenceGroup) {
      for (let elem of this.elements) {
        elem.setNotUnselectable();
      }
    }
  }

  public setAllChildrenSelected(): void {
    this.setSelectedStateRecursive(true);
  }

  public setAllChildrenUnselected(): void {
    this.setSelectedStateRecursive(false);
  }

  public setSelectedStateRecursive(selected: boolean): void {
    this.selected = selected;
    if (this instanceof SequenceGroup || this instanceof ParallelGroup) {
      for (let child of this.elements) {
        child.setSelectedStateRecursive(selected);
      }
    }
  }

  public resetSelectionStatus(): void {
    this.setAllChildrenUnselected();
    this.setSelectable(true);
  }

  public updateSurroundingSelectableElements() {
    return;
  }
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

  public setElements(elements: VariantElement[]) {
    this.elements = elements;
  }

  public getElements() {
    return this.elements;
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

  public copy(): SequenceGroup {
    const res = new SequenceGroup(this.elements.map((e) => e.copy()));
    res.expanded = this.expanded;
    return res;
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

  public updateSelectionAttributes(): void {
    updateSelectionAttributesForGroup(this);
  }

  public updateSurroundingSelectableElements(): void {
    let children = this.elements.filter((c) => isElementWithActivity(c));

    // If no children is partly selected, then selection happens on this level
    // Then calculate the next selectable elements
    let first = -1;
    let last = children.length;
    // First selected child
    for (let i = 0; i < children.length; i++) {
      if (children[i].selected) {
        first = i;
        children[first].unselectable = true;
        break;
      }
    }
    // Last selected child
    for (let i = children.length - 1; i >= 0; i--) {
      if (children[i].selected) {
        last = i;
        children[last].unselectable = true;
        break;
      }
    }

    // Adding two new selectable elements, disabling selection in lower levels
    if (first > 0) {
      children[first - 1].setSelectable();
    }
    if (last < children.length - 1) {
      children[last + 1].setSelectable();
    }
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

  public setElements(elements: VariantElement[]) {
    this.elements = elements;
  }

  public getElements() {
    return this.elements;
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

  public copy(): ParallelGroup {
    const res = new ParallelGroup(this.elements.map((e) => e.copy()));
    res.expanded = this.expanded;
    return res;
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

  public updateSelectionAttributes(): void {
    updateSelectionAttributesForGroup(this);
  }

  public updateSurroundingSelectableElements(): void {
    let children = this.elements.filter((c) => isElementWithActivity(c));
    children.forEach((c) => {
      if (!c.selected) {
        c.setSelectable();
      } else {
        c.unselectable = true;
      }
    });
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

  public getWidth(
    includeWaiting = false,
    full_text_width: boolean = false
  ): number {
    if (this.width) {
      return this.width;
    }
    if (this.expanded || includeWaiting) {
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

  public copy(): LeafNode {
    const res = new LeafNode([...this.activity]);
    res.expanded = this.expanded;
    return res;
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

  public updateSelectionAttributes(): void {
    // pass
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

  public updateSelectionAttributes(): void {
    // pass
  }
}

export class InvisibleSequenceGroup extends SequenceGroup {
  public getMarginX() {
    return 0;
  }

  public getMarginY() {
    return 0;
  }

  public setSelectable(recursive = false): void {
    this.selectable = true;

    for (let child of this.elements) {
      if (isElementWithActivity(child)) {
        child.setSelectable(recursive);
      }
    }
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
