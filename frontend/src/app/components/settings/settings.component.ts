import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backendService/backend.service';
import { Configuration } from './model';

declare var $: any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  @Input()
  showSettings: Observable<void>;
  configForm: FormGroup;

  constructor(
    private backendService: BackendService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.showSettings.subscribe(() => this.showModal());
    this.configForm = this.fb.group({
      timeoutCVariantAlignmentComputation: [null, Validators.required],
      minTracesVariantDetectionMultiprocessing: [null, Validators.required],
    });
  }

  showModal(): void {
    this.backendService.getConfiguration().subscribe((config) => {
      this.configForm.patchValue(config);
      $('#settingsModalDialog').modal('show');
    });
  }

  hideModal(): void {
    document.getElementById('close-modal').click();
  }

  saveChanges(): void {
    this.backendService
      .saveConfiguration(this.configForm.getRawValue())
      .subscribe((_) => {
        this.hideModal();
      });
  }
}
