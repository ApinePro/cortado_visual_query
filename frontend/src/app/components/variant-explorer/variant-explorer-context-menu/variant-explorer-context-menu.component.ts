import {
  AfterViewInit,
  Component,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { VariantService } from 'src/app/services/variantService/variant.service';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer/variant-drawer.directive';
import { VariantElement } from 'src/app/objects/Variants/variant_element';

@Component({
  selector: 'app-variant-explorer-context-menu',
  templateUrl: './variant-explorer-context-menu.component.html',
  styleUrls: ['./variant-explorer-context-menu.component.css'],
})
export class VariantExplorerContextMenuComponent
  implements OnChanges, AfterViewInit
{
  @Input()
  xPos: number;

  @Input()
  yPos: number;

  displayMenu: boolean = false;

  @Input()
  contextMenuOptions: Map<
    string,
    (
      variant: VariantElement,
      element: VariantElement,
      directive: VariantDrawerDirective
    ) => {}
  > = new Map<
    string,
    (
      variant: VariantElement,
      element: VariantElement,
      directive: VariantDrawerDirective
    ) => {}
  >();

  constructor() {}

  ngAfterViewInit(): void {
    this.displayMenu = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!(changes.xPos.isFirstChange() && changes.yPos.isFirstChange())) {
      this.displayMenu = true;
    }
  }

  @HostListener('window:click', ['$event'])
  public onClick(event: any): void {
    this.displayMenu = false;
  }
}
