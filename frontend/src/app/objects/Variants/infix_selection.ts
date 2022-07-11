import { InvisibleSequenceGroup, LeafNode, ParallelGroup, SequenceGroup, VariantElement, WaitingTimeNode } from "./variant_element";

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

export const allChildrenSelected = (elem: VariantElement, defaultRes: boolean) => {
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


export enum InfixType {
  PROPER_INFIX = 1,
  PREFIX = 2,
  POSTFIX = 3,
  NOT_AN_INFIX = 4,
}