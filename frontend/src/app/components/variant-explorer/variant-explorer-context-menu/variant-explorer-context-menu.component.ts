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

  @Input()
  variant: VariantElement;

  @Input()
  element: VariantElement;

  @Input()
  directive: VariantDrawerDirective;

  displayMenu: boolean = false;

  constructor(private variantService: VariantService) {}

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

  deleteVariant(e: Event) {
    this.variantService.deleteVariant(this.variant);
  }
}
