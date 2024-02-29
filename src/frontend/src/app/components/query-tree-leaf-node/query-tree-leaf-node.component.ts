import { Component, Input } from '@angular/core';
import {
  VariantElement,
  LeafNode,
  SequenceGroup,
  ParallelGroup,
  ChoiceGroup,
  FallthroughGroup,
  deserialize,
  SequencePattern,
  LeafPattern,
} from '../../objects/Variants/variant_element';
import { InfixType } from '../../objects/Variants/infix_selection';

@Component({
  selector: 'app-query-tree-leaf-node',
  templateUrl: './query-tree-leaf-node.component.html',
  styleUrls: ['./query-tree-leaf-node.component.css']
})
export class QueryTreeLeafNodeComponent {
  @Input()
  currentVariant: VariantElement;
  @Input()
  color;
  @Input()
  infixType: InfixType;
}

export namespace QueryTreeLeafNodeComponent {
  export const componentName = 'QueryTreeLeafNodeComponent';
}
