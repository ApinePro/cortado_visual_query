import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { select } from 'd3';
import { LeafNode, SequenceGroup, VariantElement } from '../model';
import { VariantFragmentComponent } from '../variant-fragment/variant-fragment.component';

@Component({
  selector: 'app-variant',
  templateUrl: './variant.component.html',
  styleUrls: ['./variant.component.css']
})
export class VariantComponent implements OnInit {

  content1 = new SequenceGroup([new LeafNode("a"), new LeafNode("b"), new LeafNode("c")]);
  content2 = new LeafNode("a");

  @Input()
  variant = [this.content1, this.content2];

  @Input()
  colorMap: Map<string, string>;

  @Output() 
  selectVariant = new EventEmitter<VariantElement[]>();

  @ViewChildren(VariantFragmentComponent)
  variantFragments: QueryList<VariantFragmentComponent>;

  constructor() { }

  ngOnInit(): void {
  }

  onClick() {
    this.selectVariant.emit(this.variant);
  }

  public setSelected(selected: boolean) {
    this.variant.forEach(v => v.setExpanded(selected));
    this.variantFragments.forEach(c => c.redraw())
  }
}
