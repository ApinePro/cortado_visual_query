import {
  ProcessTree,
  ProcessTreeOperator,
  TreePerformance,
  TreeConformance,
} from './ProcessTree';
import { VariantElement } from '../Variants/variant_element';

export class QueryTree extends ProcessTree {
  public pattern: VariantElement;
  public isLeaf: boolean = false;
  public negation: boolean = false;
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
    pattern: VariantElement
  ) {
    super(
      label,
      operator,
      children,
      id,
      frozen,
      performance,
      conformance,
      parent
    );
    this.pattern = pattern;
    this.negation = negation;
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
      this.pattern.copy(),
    );

    if (parentRelation)
      treeCopy.children.forEach((child) => {
        child.parent = treeCopy;
      });
    return treeCopy;
  }
}
