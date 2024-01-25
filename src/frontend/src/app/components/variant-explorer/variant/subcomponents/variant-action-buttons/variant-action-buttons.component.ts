import {Component, Input, QueryList} from '@angular/core';
import {VariantService} from 'src/app/services/variantService/variant.service';
import {takeUntil} from "rxjs/operators";
import {Pair} from "../../../../../directives/arc-diagram/data";
import {ArcDiagramDirective} from "../../../../../directives/arc-diagram/arc-diagram.directive";
import {VariantDrawerDirective} from "../../../../../directives/variant-drawer/variant-drawer.directive";
import {IVariant} from "../../../../../objects/Variants/variant_interface";
import {Subject} from "rxjs";

@Component({
  selector: 'app-variant-action-buttons',
  templateUrl: './variant-action-buttons.component.html',
  styleUrls: ['./variant-action-buttons.component.css'],
})
export class VariantActionButtonsComponent {
  @Input()
  private variant: IVariant;
  @Input()
  protected variantDrawers: QueryList<VariantDrawerDirective>
  @Input()
  protected arcDiagrams: QueryList<ArcDiagramDirective>

  constructor(private variantService: VariantService) {}

  private _destroy$ = new Subject();

  deleteVariant() {
    this.variantService.deleteVariant(this.variant.bid);
  }

  showArcDiagram() {
    this.variantService
      .showArcDiagram(this.variant.bid)
      .pipe(takeUntil(this._destroy$))
      .subscribe((res: Pair[]) => {
        const arcDiagramDir: ArcDiagramDirective = this.arcDiagrams.find((dir: ArcDiagramDirective) => dir.variant.bid == this.variant.bid);
        const arcs = arcDiagramDir.parseInput(res);
        // this.arcs[this.variant.bid] = arcs;
        const variantDrawerDir: VariantDrawerDirective = this.variantDrawers.find((drawer: VariantDrawerDirective) => drawer.variant.id == this.variant.id);
        arcDiagramDir.draw(
          arcs,
          variantDrawerDir
        );
      });
  };
}
