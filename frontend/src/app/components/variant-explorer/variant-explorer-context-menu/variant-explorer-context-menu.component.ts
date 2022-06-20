import { VariantDrawerDirective } from 'src/app/directives/variant-drawer.directive';
import {
  Component,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { VariantElement } from '../model';
import { VariantService } from 'src/app/services/variantService/variant.service';

@Component({
  selector: 'app-variant-explorer-context-menu',
  templateUrl: './variant-explorer-context-menu.component.html',
  styleUrls: ['./variant-explorer-context-menu.component.css'],
})
export class VariantExplorerContextMenuComponent implements OnChanges {
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
  ngOnChanges(changes: SimpleChanges): void {
    this.displayMenu = true;
  }

  @HostListener('window:click', ['$event'])
  public onClick(event: any): void {
    this.displayMenu = false;
  }

  deleteVariant(e: Event) {
    const bids = this.variantService.variants
      .filter((v) => v.variant === this.variant)
      .map((v) => v.bid);

    this.variantService.deleteVariants(bids);
  }
}
