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
  constructor(
    label: string,
    operator: ProcessTreeOperator,
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
  }
}
