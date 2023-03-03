import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer/variant-drawer.directive';
import { LocalProcessModelWithPatterns } from 'src/app/objects/LocalProcessModelWithPatterns';
import { VariantElement } from 'src/app/objects/Variants/variant_element';
import { LazyLoadingServiceService } from 'src/app/services/lazyLoadingService/lazy-loading.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-lpm-explorer-row]',
  templateUrl: './lpm-explorer-row.component.html',
  styleUrls: ['./lpm-explorer-row.component.scss'],
})
export class LpmExplorerRowComponent implements AfterViewInit {
  @Input()
  lpm;

  @Input()
  nPatterns: number;

  @Input()
  pattern: VariantElement;

  @ViewChild('row')
  rowElement: ElementRef;

  @Input()
  rootElement: ElementRef;

  @Input()
  showLpm: boolean;

  @ViewChild(VariantDrawerDirective)
  variantDrawer: VariantDrawerDirective;

  constructor(private lazyLoadingService: LazyLoadingServiceService) {}

  isVisible: boolean = false;

  ngAfterViewInit(): void {
    const self = this;
    // TODO remove
    this.isVisible = true;

    // this.lazyLoadingService.addSubPattern(
    //   this.rowElement.nativeElement.parentNode,
    //   this.rootElement,
    //   (isIntersecting) => {
    //     self.isVisible = isIntersecting;
    //   }
    // );
  }
}
