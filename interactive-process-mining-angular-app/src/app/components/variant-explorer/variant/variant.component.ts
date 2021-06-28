import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { select } from 'd3';
import { LeafNode, SequenceGroup, VariantElement } from '../model';

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

  constructor() { }

  ngOnInit(): void {
  }

  onClick() {
    this.selectVariant.emit(this.variant);
  }
}
