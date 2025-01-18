import {
  ProcessTree,
  ProcessTreeOperator,
  TreePerformance,
  TreeConformance,
} from './ProcessTree';
import { VariantElement } from '../Variants/variant_element';
import { PT_Constant } from './../../constants/process_tree_drawer_constants';

export class QueryTree extends ProcessTree {
  public pattern: VariantElement;
  public isLeaf: boolean = false;
  public negation: boolean = false;
  public offset: number = 0;
  constructor(
    label: string,
    operator: ProcessTreeOperator,
    negation: boolean,
    children: ProcessTree[],
    id: number,
    frozen: boolean,
    performance: TreePerformance,
    conformance: TreeConformance,
    parent: ProcessTree,
    pattern: VariantElement,
    offset: number,
  ) {
    super(
      label,
      operator,
      children,
      id,
      frozen,
      performance,
      conformance,
      parent,
    );
    this.pattern = pattern;
    this.negation = negation;
    this.offset = offset;
  }

  public copy(
    parentRelation: boolean = true,
    newId: boolean = false
  ): ProcessTree {
    const children = this.children.map((child) =>
      child.copy(parentRelation, newId)
    );

    const treeCopy = new QueryTree(
      this.label,
      this.operator,
      this.negation,
      children,
      newId ? Math.floor(1000000000 + Math.random() * 900000000) : this.id,
      this.frozen,
      this.performance,
      this.conformance,
      null,
      this.pattern ? this.pattern.copy() : null,
      this.offset,
    );

    if (parentRelation)
      treeCopy.children.forEach((child) => {
        child.parent = treeCopy;
      });
    return treeCopy;
  }

  public computeOffset(): number {
    let offset = 0;
    if (this.pattern){
      if (this.children.length == 0) {
        offset = this.pattern.getHeight() - PT_Constant.QNODE_HEIGHT_WIDTH;
        this.offset = offset;
      }
      else {
        for (const child of this.children) {
          offset = offset + (child as QueryTree).computeOffset();
        }
        this.offset = offset;
      }
    }
    return offset;
  }
}

/*
const siblings = node.parent.children;
const nodeIndex = siblings.indexOf(node);
let i = siblings.length - 1;
while (i > nodeIndex) {
  siblings[i].x =
    siblings[i].x +
    node.data.pattern.getHeight() -
    PT_Constant.QNODE_HEIGHT_WIDTH;
  i -= 1;
}*/