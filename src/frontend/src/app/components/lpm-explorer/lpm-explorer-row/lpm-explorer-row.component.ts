import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer/variant-drawer.directive';
import { LocalProcessModelWithPatterns } from 'src/app/objects/LocalProcessModelWithPatterns';
import { LazyLoadingServiceService } from 'src/app/services/lazyLoadingService/lazy-loading.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-lpm-explorer-row]',
  templateUrl: './lpm-explorer-row.component.html',
  styleUrls: ['./lpm-explorer-row.component.scss'],
})
export class LpmExplorerRowComponent {
  @Input()
  lpm: LocalProcessModelWithPatterns;

  @ViewChild('row')
  rowElement: ElementRef;

  @Input()
  rootElement: ElementRef;

  @ViewChild(VariantDrawerDirective)
  variantDrawer: VariantDrawerDirective;

  constructor(private lazyLoadingService: LazyLoadingServiceService) {}

  isVisible: boolean = false;

  ngAfterViewInit(): void {
    const self = this;

    this.lazyLoadingService.addSubPattern(
      this.rowElement.nativeElement.parentNode,
      this.rootElement,
      (isIntersecting) => {
        self.isVisible = isIntersecting;
      }
    );
  }
}
