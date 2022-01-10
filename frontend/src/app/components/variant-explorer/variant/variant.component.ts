import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Variant } from '../model';

@Component({
  selector: '[app-variant]',
  templateUrl: './variant.component.html',
  styleUrls: ['./variant.component.scss']
})
export class VariantComponent implements AfterViewInit {
  @Input()
  index: number;

  @Input()
  variant: Variant;

  @Input()
  colorMap: Map<string, string>;

  @Output()
  public selectionChanged = new EventEmitter<boolean>();

  @Output()
  public updateConformance = new EventEmitter<Variant>();

  @ViewChild('row')
  rowElement: ElementRef;

  isVisible: boolean = false;

  ngAfterViewInit(): void {
    const self = this;
    const observer = new IntersectionObserver(function (entries) {
      self.isVisible = entries[0]['isIntersecting'];
    }, { root: null, rootMargin: "200px" }); // TODO Niklas check if it works

    // observing a target element
    observer.observe(this.rowElement.nativeElement);
  }
}
