import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Variant } from 'src/app/objects/Variants/variant';
import { BackendService } from 'src/app/services/backendService/backend.service';

declare var $: any;

@Component({
  selector: 'app-variant-conformance-dialog',
  templateUrl: './variant-conformance-dialog.component.html',
  styleUrls: ['./variant-conformance-dialog.component.scss'],
})
export class VariantConformanceDialogComponent implements OnInit, OnDestroy {
  @Input()
  showConformanceDialog: Observable<Variant>;

  @Output()
  public updateConformanceWithCustomTimeout = new EventEmitter<VariantTimeout>();

  variant: Variant;
  conformanceTimeout: number = 30;

  private _destroy$ = new Subject();

  constructor(private backendService: BackendService) {}

  ngOnInit(): void {
    this.showConformanceDialog
      .pipe(takeUntil(this._destroy$))
      .subscribe((variant: Variant) => {
        this.variant = variant;
        this.backendService
          .getConfiguration()
          .pipe(takeUntil(this._destroy$))
          .subscribe((config) => {
            this.conformanceTimeout =
              config.timeoutCVariantAlignmentComputation + 30;
            $('#conformanceModalDialog').modal('show');
          });
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  hideModal(): void {
    document.getElementById('close-modal-conformance').click();
  }

  calculateConformance(): void {
    const vt = new VariantTimeout();
    vt.variant = this.variant;
    vt.timeout = this.conformanceTimeout;
    this.updateConformanceWithCustomTimeout.emit(vt);
    this.hideModal();
  }
}

class VariantTimeout {
  variant: Variant;
  timeout: number;
}
