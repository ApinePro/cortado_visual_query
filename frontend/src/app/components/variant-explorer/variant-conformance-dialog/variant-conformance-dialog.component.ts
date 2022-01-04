import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backendService/backend.service';
import { Variant } from '../model';

declare var $: any;

@Component({
  selector: 'app-variant-conformance-dialog',
  templateUrl: './variant-conformance-dialog.component.html',
  styleUrls: ['./variant-conformance-dialog.component.scss']
})
export class VariantConformanceDialogComponent implements OnInit {
  @Input()
  showConformanceDialog: Observable<Variant>;

  @Output()
  public updateConformanceWithCustomTimeout = new EventEmitter<VariantTimeout>();

  variant: Variant;
  conformanceTimeout: number = 30;

  constructor(private backendService: BackendService) { }

  ngOnInit(): void {
    this.showConformanceDialog.subscribe((variant: Variant) => {
      this.variant = variant;
      this.backendService.getConfiguration().subscribe(config => {
        this.conformanceTimeout = config.timeoutCVariantAlignmentComputation + 30;
        $("#conformanceModalDialog").modal('show');
      });
    });
  }

  hideModal(): void {
    document.getElementById('close-modal-conformance').click();
  }

  calculateConformance(): void {
    const vt = new VariantTimeout()
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
