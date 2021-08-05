import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { VariantElement } from '../model';
import { VariantFragmentComponent } from '../variant-fragment/variant-fragment.component';

@Component({
  selector: 'app-variant',
  templateUrl: './variant.component.html',
  styleUrls: ['./variant.component.css']
})
export class VariantComponent implements OnInit {

  @Input()
  variant;

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
    this.variant.setExpanded(selected);
    this.variantFragments.forEach(c => c.redraw())
  }

  private rendered: boolean = false;

  public draw() {
    if(!this.rendered) {
      this.variantFragments.forEach(v => v.redraw())
    }
    this.rendered = true;
  }
}
