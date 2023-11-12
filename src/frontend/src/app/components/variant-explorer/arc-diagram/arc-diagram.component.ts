import { Component, Input, QueryList } from '@angular/core';
import { Variant } from 'src/app/objects/Variants/variant';
import { Arc, Data } from './data';
import * as d3 from 'd3';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer/variant-drawer.directive';
import { VariantElement } from 'src/app/objects/Variants/variant_element';

@Component({
  selector: 'app-arc-diagram',
  templateUrl: './arc-diagram.component.html',
  styleUrls: [],
})
export class ArcDiagramComponent {
  constructor() {}

  @Input()
  contextMenu_variant: VariantElement;

  @Input()
  contextMenu_directive: VariantDrawerDirective;
}
