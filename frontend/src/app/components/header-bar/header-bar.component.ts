import { Component, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BackendService } from '../../services/backendService/backend.service';

@Component({
  selector: 'app-header-bar',
  templateUrl: './header-bar.component.html',
  styleUrls: ['./header-bar.component.css'],
})
export class HeaderBarComponent {
  @ViewChild('fileUploadEventLog') fileUploadEventLog: ElementRef;
  @ViewChild('fileUploadProcessTree') fileUploadProcessTree: ElementRef;

  showSettingsEvent: Subject<void> = new Subject<void>();

  constructor(
    private backendService: BackendService,
    private _elRef: ElementRef<HTMLElement>
  ) {}

  get element() {
    return this._elRef.nativeElement;
  }

  importEventLog(): void {
    this.fileUploadEventLog.nativeElement.click();
  }

  handleSelectedEventLogFile(e): void {
    const fileList: FileList = e.target.files;
    if (fileList.length > 0) {
      console.log(fileList[0]);
      if (!environment.electron) {
        this.backendService.uploadEventLog(fileList[0]);
      } else {
        this.backendService.loadEventLogFromFilePath(fileList[0]['path']);
      }
    }
    // reset form
    this.fileUploadEventLog.nativeElement.value = '';
  }

  handleSelectedProcessTreeFile(e): void {
    // console.log(e);
    const fileList: FileList = e.target.files;
    if (fileList.length > 0) {
      // console.log(fileList[0]);
      this.backendService.loadProcessTreeFromFilePath(fileList[0]['path']);
    }
    this.fileUploadProcessTree.nativeElement.value = '';
  }

  exportTreeAsPTML(): void {
    this.backendService.downloadCurrentTreeAsPTML();
  }

  exportTreeAsPNML(): void {
    this.backendService.downloadCurrentTreeAsPNML();
  }

  importTreeFromPTML(): void {
    this.fileUploadProcessTree.nativeElement.click();
  }

  showSettingsDialog(): void {
    this.showSettingsEvent.next();
  }

  /* Handle Electron Window Behavior via IPC messages
  toggleHide(): void{
    this.ipc.send('maximize-window')
  }

  toggleMaximization(): void {
    this.ipc.send('maximize-window')
  }

  closeApp(): void {
    this.ipc.send('maximize-window')
  }
  */
}
