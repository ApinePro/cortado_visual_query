import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer.directive';
import { Variant, VariantElement } from '../../variant-explorer/model';
import { SubvariantPattern } from '../variant-miner.component';

@Component({
  selector: 'app-variant-miner-pattern',
  templateUrl: './variant-miner-pattern.component.html',
  styleUrls: ['./variant-miner-pattern.component.css'],
})
export class VariantMinerPatternComponent {
  @Input()
  pattern: SubvariantPattern;

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

  @ViewChild(VariantDrawerDirective)
  variantDrawer: VariantDrawerDirective;

  @ViewChild('fragment')
  fragment: ElementRef;
  constructor() {}
}
