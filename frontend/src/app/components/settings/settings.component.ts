import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backendService/backend.service';
import { Configuration } from './model';

declare var $: any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

export class SettingsComponent implements OnInit {

  @Input()
  showSettings: Observable<void>;

  configuration: Configuration = new Configuration();

  constructor(private backendService: BackendService) { }

  ngOnInit(): void {
    this.showSettings.subscribe(() => this.showModal());
  }

  showModal(): void {
    this.backendService.getConfiguration().subscribe(config => {
      this.configuration = config
      $("#settingsModalDialog").modal('show');
    });
  }

  hideModal(): void {
    document.getElementById('close-modal').click();
  }

  saveChanges(): void {
    this.backendService.saveConfiguration(this.configuration).subscribe(_ => {
      this.hideModal();
    });
  }
}
