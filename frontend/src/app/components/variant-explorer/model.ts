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

const allChildrenSelected = (elem: VariantElement, defaultRes: boolean) => {
  if (elem instanceof LeafNode) {
    return elem.selected;
  } else if (elem instanceof ParallelGroup || elem instanceof SequenceGroup) {
    let res = true;
    for (let i = 0; i < elem.elements.length; i++) {
      if (isElementWithActivity(elem.elements[i])) {
        res =
          res &&
          allChildrenSelected(elem.elements[i], elem.elements[i].selected);
      }
    }
    return res;
  } else {
    // Waiting Time Node, etc...
    return defaultRes;
  }
};

export const someChildrenSelected = (
  elem: VariantElement,
  defaultRes: boolean
) => {
  if (elem instanceof LeafNode) {
    return elem.selected;
  } else if (elem instanceof ParallelGroup || elem instanceof SequenceGroup) {
    let res = false;
    for (let i = 0; i < elem.elements.length; i++) {
      if (isElementWithActivity(elem.elements[i])) {
        res =
          res ||
          someChildrenSelected(elem.elements[i], elem.elements[i].selected);
      }
    }
    return res;
  } else {
    // Waiting Time Node, etc...
    return defaultRes;
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

export const getLowestSelectableParent = (elem: VariantElement) => {
  if (elem.selectable || elem.parent == null) {
    // Selectable or root
    return elem;
  } else {
    return getLowestSelectableParent(elem.parent);
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
      if (
        !(child instanceof WaitingTimeNode) &&
        someChildrenSelected(child, true)
      ) {
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
export const handleTreeLevelsWithOneChild = (elem: VariantElement) => {
  if (elem instanceof LeafNode) {
    return elem;
  } else if (elem instanceof SequenceGroup || elem instanceof ParallelGroup) {
    if (elem.elements.length == 1) {
      let onlyChild = handleTreeLevelsWithOneChild(elem.elements[0]);
      return onlyChild;
    } else {
      let newChildren = elem.elements.map(handleTreeLevelsWithOneChild);
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

  public height;
  width;

  public inspectionMode = false;

  public parent;

  public selectionHistory = [{ selected: false, selectable: true }]; // contains JSON objects {"selectable": boolean, "selected": boolean}
  public currentIdxSelectionHistory = 0;

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

  public abstract calculateSelectableElements(): void;
  public abstract getActivities(): Set<string>;

  public setSelectable(): void {
    this.selectable = true;
  }

  public disableSelectableAllChildren(): void {
    this.selectable = false;
    if (this instanceof ParallelGroup || this instanceof SequenceGroup) {
      for (let elem of this.elements) {
        elem.disableSelectableAllChildren();
      }
    }
  }

  public setAllChildrenSelected(): void {
    this.selected = true;
    if (this instanceof SequenceGroup || this instanceof ParallelGroup) {
      for (let child of this.elements) {
        child.setAllChildrenSelected();
      }
    }
  }

  public resetSelectionStatus(): void {
    this.selected = false;
    this.selectable = true;
    this.selectionHistory = [{ selected: false, selectable: true }];
    this.currentIdxSelectionHistory = 0;
    if (this instanceof SequenceGroup || this instanceof ParallelGroup) {
      for (let child of this.elements) {
        child.resetSelectionStatus();
      }
    }
  }

  public applySelectionHistory(): void {
    let toBeApplied = this.selectionHistory[this.currentIdxSelectionHistory];
    this.selected = toBeApplied['selected'];
    this.selectable = toBeApplied['selectable'];
  }

  public saveCurrentSelectionToSelectionHistory(): void {
    let toBeInserted = {
      selected: this.selected,
      selectable: this.selectable,
    };
    this.selectionHistory.splice(
      this.currentIdxSelectionHistory + 1,
      this.selectionHistory.length - this.currentIdxSelectionHistory - 1,
      toBeInserted
    );
    this.currentIdxSelectionHistory++;
    if (this instanceof SequenceGroup || this instanceof ParallelGroup) {
      for (let child of this.getElements()) {
        if (isElementWithActivity(child)) {
          child.saveCurrentSelectionToSelectionHistory();
        }
      }
    }
  }

  public undoSelection(): void {
    if (this.currentIdxSelectionHistory > 0) {
      this.currentIdxSelectionHistory--;
      this.applySelectionHistory();
      if (this instanceof SequenceGroup || this instanceof ParallelGroup) {
        for (let child of this.getElements()) {
          if (isElementWithActivity(child)) {
            child.undoSelection();
          }
        }
      }
    }
  }

  public redoSelection(): void {
    if (this.currentIdxSelectionHistory < this.selectionHistory.length - 1) {
      this.currentIdxSelectionHistory++;
      this.applySelectionHistory();
      if (this instanceof SequenceGroup || this instanceof ParallelGroup) {
        for (let child of this.getElements()) {
          if (isElementWithActivity(child)) {
            child.redoSelection();
          }
        }
      }
    }
  }

  public selectionStatusUnchangedFromLastSavedSelection(): boolean {
    let checkpoint = this.selectionHistory[this.currentIdxSelectionHistory];
    let unchanged =
      this.selected == checkpoint['selected'] &&
      this.selectable == checkpoint['selectable'];
    if (this instanceof LeafNode) {
      return unchanged;
    } else if (this instanceof ParallelGroup || this instanceof SequenceGroup) {
      for (let child of this.getElements()) {
        if (isElementWithActivity(child)) {
          unchanged =
            unchanged && child.selectionStatusUnchangedFromLastSavedSelection();
        }
      }
      return unchanged;
    }
  }

  public abstract asString(): string;
  public abstract deleteActivity(activityName: string) : [VariantElement, boolean];
  public abstract renameActivity(activityName: string, newActivityName : string) : void;
}

export class SequenceGroup extends VariantElement {


  public getActivities(): Set<string> {
    const res : Set<string> = new Set<string>();

    this.elements.forEach((e) => e.getActivities().forEach((a) => res.add(a)))

    return res
  }

  public renameActivity(activityName: string, newActivityName: string) {
    this.elements.forEach((e) => {e.renameActivity(activityName, newActivityName)});
  }

  public deleteActivity(activityName: string) : [VariantElement, boolean] {
    const newElems : VariantElement[] = [];

    for (let elem of this.elements) {
      if (!(elem instanceof WaitingTimeNode)) {
        const res = elem.deleteActivity(activityName);

        if (res[1]) {
          // Found a Fallthrough Stop Early
          console.warn('Found a Fallthrough')
          return [this, true];
        } else {
          // We append the result
          if (res[0]) {
            newElems.push(res[0]);
            res[0].parent = this
          }
        }
      }
    }


    if (newElems.length > 1 || (newElems.length === 1 && !this.parent && !(this instanceof InvisibleSequenceGroup))) {
      this.elements = newElems;
      return [this, false];
    } else if (newElems.length === 1) {
      return [newElems[0], false];
    } else {
      return [null, false];
    }
  }

  public asString(): string {
    return (
      '->(' +
      this.elements.filter((v) => {return !(v instanceof WaitingTimeNode)})
        .map((v) => {
          return v.asString();
        })
        .join(', ') +
      ')'
    );
  }

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

  public calculateSelectableElements(): void {
    // Get all variant element containing activities
    let indexes = [];
    for (let i = 0; i < this.elements.length; i++) {
      if (isElementWithActivity(this.elements[i])) {
        indexes.push(i);
        // Set correct selected status
        this.elements[i].selected = allChildrenSelected(
          this.elements[i],
          this.elements[i].selected
        );
      }
    }

    // Handling the InvisibleSequenceGroup case
    if (this instanceof InvisibleSequenceGroup) {
      let onlyChild = this.elements[indexes[0]];
      if (onlyChild.selected) {
        this.selected = true;
      }

      onlyChild.calculateSelectableElements();

      return;
    }

    // Check if the parent element is itself selected
    let selected = true;
    for (let k = 0; k < indexes.length; k++) {
      selected = selected && this.elements[indexes[k]].selected;
    }
    this.selected = selected;

    // Check which children are selectable

    // First, check if a child is only partly selected
    // If yes, set all other children to be not selectable and call this function on that child
    let partlySelected = -1;
    for (let p = 0; p < indexes.length; p++) {
      let elem = this.elements[indexes[p]];
      if (
        someChildrenSelected(elem, elem.selected) &&
        !allChildrenSelected(elem, elem.selected)
      ) {
        partlySelected = p;
        for (let z = 0; z < indexes.length; z++) {
          if (z != partlySelected) {
            this.elements[indexes[z]].disableSelectableAllChildren();
          }
        }

        elem.calculateSelectableElements();
        break;
      }
    }

    // If no children is partly selected, then selection happens on this level
    // Then calculate the next selectable elements
    if (partlySelected === -1) {
      let first = -1;
      let last = -Math.max(); // Infinity
      // First selected child
      for (let j = 0; j < indexes.length; j++) {
        if (this.elements[indexes[j]].selected) {
          first = j;
          break;
        }
      }
      // Last selected child
      for (let l = indexes.length - 1; l >= 0; l--) {
        if (this.elements[indexes[l]].selected) {
          last = l;
          break;
        }
      }
      // Adding two new selectable elements, disabling selection in lower levels
      if (first > 0) {
        this.elements[indexes[first - 1]].disableSelectableAllChildren();
        this.elements[indexes[first - 1]].setSelectable();
      }
      if (last < indexes.length - 1) {
        this.elements[indexes[last + 1]].disableSelectableAllChildren();
        this.elements[indexes[last + 1]].setSelectable();
      }
      // Set all other elements to be not selectable
      for (let m = 0; m < first - 1; m++) {
        this.elements[indexes[m]].disableSelectableAllChildren();
      }
      for (let n = indexes.length - 1; n > last + 1; n--) {
        this.elements[indexes[n]].disableSelectableAllChildren();
      }
    }
  }
}

export class ParallelGroup extends VariantElement {

  public getActivities(): Set<string> {
    const res : Set<string> = new Set<string>();

    this.elements.forEach((e) => e.getActivities().forEach((a) => res.add(a)))

    return res
  }

  public renameActivity(activityName: string, newActivityName: string) {
    this.elements.forEach((e) => {e.renameActivity(activityName, newActivityName)});
  }

  public deleteActivity(activityName: string) : [VariantElement, boolean] {
    const newElems = [];

    for (let elem of this.elements) {
      if (!(elem instanceof WaitingTimeNode)) {
        const res = elem.deleteActivity(activityName);

        if (res[1]) {
          // Found a Fallthrough Stop Early
          return [this, true];
        } else {
          // We append the result
          if (res[0]) {
            newElems.push(res[0]);
            res[0].parent = this;
          }
        }
      }
    }

    if (newElems.length > 1) {
      this.elements = newElems;
      return [this, false];
    } else if (newElems.length === 1) {
      return [newElems[0], false];
    } else {
      return [null, false];
    }
  }

  constructor(public elements: VariantElement[], performance: any = undefined) {
    super(performance);
  }

  public asString(): string {
    return (
      '+(' +
      this.elements
        .filter((v) => {
          return !(v instanceof WaitingTimeNode);
        })
        .map((v) => {
          return v.asString();
        })
        .join(', ') +
      ')'
    );
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

  public calculateSelectableElements(): void {
    // Get all variant element containing activities
    let indexes = [];
    for (let i = 0; i < this.elements.length; i++) {
      if (isElementWithActivity(this.elements[i])) {
        indexes.push(i);
        // Set correct selected status
        this.elements[i].selected = allChildrenSelected(
          this.elements[i],
          this.elements[i].selected
        );
      }
      // Handling InvisibleSequenceGroup
      if (this.elements[i] instanceof InvisibleSequenceGroup) {
        this.elements[i].calculateSelectableElements();
      }
    }

    // Check if the parent element is itself selected
    let selected = true;
    for (let k = 0; k < indexes.length; k++) {
      selected = selected && this.elements[indexes[k]].selected;
    }
    this.selected = selected;

    // Check which children are selectable
    // First check if there is a partly selected child. If yes, only allow selection within that child
    let partlySelected = -1;
    for (let p = 0; p < indexes.length; p++) {
      let elem = this.elements[indexes[p]];
      if (
        someChildrenSelected(elem, elem.selected) &&
        !allChildrenSelected(elem, elem.selected)
      ) {
        partlySelected = p;
        for (let z = 0; z < indexes.length; z++) {
          if (z != partlySelected) {
            this.elements[indexes[z]].disableSelectableAllChildren();
          }
        }
        elem.calculateSelectableElements();
        break;
      }
    }

    if (partlySelected === -1) {
      // No partly selected child found
      // Then all unselected children are selectable, but only at this level
      for (let child of this.elements) {
        if (!child.selected) {
          child.disableSelectableAllChildren();
          child.setSelectable();
        }
        if (child instanceof InvisibleSequenceGroup) {
          for (let i = 0; i < child.elements.length; i++) {
            if (isElementWithActivity(child.elements[i])) {
              child.elements[i].setSelectable();
            }
          }
        }
      }
    }
  }
}

export class LeafNode extends VariantElement {

  public getActivities(): Set<string> {
    return new Set<string>(this.activity);
  }

  public renameActivity(activityName: string, newActivityName: string) {
    this.activity = this.activity.map((a) => { return a === activityName ? newActivityName : a})
  }

  public deleteActivity(activityName: string) : [VariantElement, boolean]{
    if (this.activity.includes(activityName)) {
      if (this.activity.length > 1) {
        return [this, true];
      } else {
        return [null, false];
      }
    }

    return [this, false];
  }

  public textLength: number = 10;

  public asString(): string {
    return this.activity.join(';');
  }

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

  public calculateSelectableElements(): void {
    // pass
  }
}

export class WaitingTimeNode extends VariantElement {

  public getActivities(): Set<string> {
    return new Set<string>();
  }

  public renameActivity(activityName: string, newActivityName: string) {
  }

  public deleteActivity(activityName: string) : [VariantElement, boolean] {
    return [null, false];
  }

  public asString(): string {
    return '';
  }

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

  public calculateSelectableElements(): void {
    // pass
  }
}

export class InvisibleSequenceGroup extends SequenceGroup {

  public asString(): string {
    return this.elements[1].asString();
  }

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
    return new LeafNode(obj['leaf'], obj['performance']) ;
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



export function injectWaitingTimeNodes(variants: VariantElement[]) {
  variants.forEach((v) => injectWaitingTimeNodesVariant(v));
}

export function injectWaitingTimeNodesVariant(variant: VariantElement) {

  if (variant instanceof SequenceGroup) {
    variant
      .asSequenceGroup()
      .elements.filter((v) => !(v instanceof LeafNode))
      .forEach((e) => injectWaitingTimeNodesVariant(e));

    for (let i = 0; i < variant.asSequenceGroup().elements.length; i++) {
      let v = variant.asSequenceGroup().elements[i];

      if (v.waitingTime?.mean !== undefined) {
        let wait = new WaitingTimeNode(v.waitingTime);
        v.waitingTime = undefined;
        variant.elements.splice(i, 0, wait);
        i += 1;
      }
    }
  }

  if (variant instanceof ParallelGroup) {
    variant
      .asParallelGroup()
      .elements.filter((v) => !(v instanceof LeafNode))
      .forEach((e) => injectWaitingTimeNodesVariant(e));

    for (let i = 0; i < variant.asSequenceGroup().elements.length; i++) {
      let v = variant.asParallelGroup().elements[i];
      let waitGroup = [v];
      if (v.waitingTimeStart?.mean !== undefined) {
        let wait = new WaitingTimeNode(v.waitingTimeStart);
        waitGroup.splice(0, 0, wait);
      }

      if (v.waitingTimeEnd?.mean !== undefined) {
        let wait = new WaitingTimeNode(v.waitingTimeEnd);
        waitGroup.splice(waitGroup.length, 0, wait);
      }
      variant.elements[i] = new InvisibleSequenceGroup(waitGroup);
    }
  }
}
