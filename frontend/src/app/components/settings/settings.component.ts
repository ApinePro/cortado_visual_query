import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TimeUnit } from 'src/app/objects/TimeUnit';
import { BackendService } from 'src/app/services/backendService/backend.service';
import { SettingsService } from 'src/app/services/settingsService/settings.service';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
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

  configuration: Configuration = new Configuration();

  constructor(
    private backendService: BackendService,
    private settingsService: SettingsService,
    private dataService: SharedDataService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.showSettings.subscribe(() => this.showModal());
    this.configForm = this.fb.group({
      timeoutCVariantAlignmentComputation: [null, Validators.required],
      minTracesVariantDetectionMultiprocessing: [null, Validators.required],
      // timeGranularity: [null, Validators.required],
    });
  }

  onGranularityChange(event) {
    this.dataService.timeGranularity = event;
  }

  showModal(): void {
    this.backendService
      .getConfiguration()
      .pipe(
        tap((config) => {
          this.settingsService.notify(config);
        })
      )
      .subscribe((config) => {
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
      .pipe(
        tap(() => this.settingsService.notify(this.configForm.getRawValue()))
      )
      .subscribe((_) => {
        this.hideModal();
      });
  }
}
