import { Component, Input, OnDestroy, OnInit, EventEmitter, Output} from '@angular/core';
import { VariantService } from 'src/app/services/variantService/variant.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
declare var $;

@Component({
  selector: 'app-cardinality-modal',
  templateUrl: './cardinality-modal.component.html',
  styleUrls: ['./cardinality-modal.component.css'],
})
export class CardinalityModalComponent implements OnInit, OnDestroy {

  @Output() cardiConfirmed = new EventEmitter();

  redundancyWarning = false;
  public cardinality: number = 0;
  private _destroy$ = new Subject();

  constructor(private variantService: VariantService) {
    const a = 1;
  }

  ngOnInit(): void {
    this.variantService.showCardinalityDialog
      .pipe(takeUntil(this._destroy$))
      .subscribe((_) => {
        console.log('start!!!!');
        this.showModal();
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  showModal(): void {
    $('#cardinalityModalDialog').modal('show');
  }

  hideModal(): void {
    $('#cardinalityModalDialog').modal('hide');
  }

  applyCardinality() {
    this.cardiConfirmed.emit({
      cardinality: this.cardinality
    });
    this.hideModal();
  }
}
