import { LazyLoadingServiceService } from 'src/app/services/lazyLoadingService/lazy-loading.service';
import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer.directive';
import { VariantElement } from '../../variant-explorer/model';
import { SubvariantPattern } from '../variant-miner-types';
import { InfixType } from 'src/app/components/variant-explorer/model';
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-variant-miner-pattern]',
  templateUrl: './variant-miner-pattern.component.html',
  styleUrls: ['./variant-miner-pattern.component.css'],
})
export class VariantMinerPatternComponent implements AfterViewInit {
  @Input()
  pattern: SubvariantPattern;
  infixtype = InfixType;

  @Input()
  computeActivityColor: (
    drawerDirective: VariantDrawerDirective,
    element: VariantElement,
    variant: VariantElement
  ) => string;

  @Input()
  onClickCbFc: (
    drawerDirective: VariantDrawerDirective,
    element: VariantElement
  ) => void;

  @Input()
  index: number;

  @Input()
  onMouseOverCbFc: (
    drawerDirective: VariantDrawerDirective,
    element: VariantElement
  ) => void;

  @ViewChild('row')
  rowElement: ElementRef;

  @Input()
  rootElement: ElementRef;

  @ViewChild(VariantDrawerDirective)
  variantDrawer: VariantDrawerDirective;

  @ViewChild('fragment')
  fragment: ElementRef;
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
