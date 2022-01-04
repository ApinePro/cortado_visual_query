import { Component, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BackendService } from '../../services/backendService/backend.service';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css'],
})
export class SideBarComponent {
  showSettingsEvent: Subject<void> = new Subject<void>();

  constructor(
    private backendService: BackendService,
    private _elRef: ElementRef<HTMLElement>
  ) {}

  @ViewChild('fileUploadEventLog') fileUploadEventLog: ElementRef;
  @ViewChild('fileUploadProcessTree') fileUploadProcessTree: ElementRef;

  importEventLog(): void {
    this.fileUploadEventLog.nativeElement.click();
  }

  get element() {
    return this._elRef.nativeElement;
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
}
