import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {BackendService} from "../../services/backendService/backend.service";
import {BackgroundTaskInfoService} from "../../services/backgroundTaskInfoService/background-task-info.service";
import {SharedDataService} from "../../services/sharedDataService/shared-data.service";

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {

  constructor(private backendService: BackendService,
              private backgroundTaskInfoService: BackgroundTaskInfoService,
              private sharedDataService: SharedDataService) {
  }

  ngOnInit(): void {
  }

  @ViewChild('fileUploadEventLog') fileUploadEventLog: ElementRef;
  @ViewChild('fileUploadProcessTree') fileUploadProcessTree: ElementRef;

  importEventLog(): void {
    this.fileUploadEventLog.nativeElement.click();
  }

  handleSelectedEventLogFile(e): void {
    const taskDescription = 'Loading/parsing event log';
    this.backgroundTaskInfoService.setNewTask(taskDescription);

    const fileList: FileList = e.target.files;
    if (fileList.length > 0) {
      console.log(fileList[0]);
      const fileName = fileList[0].name;
      // TODO make it also work with browser by uploading the file instead of just the file path
      /*this.backendService.uploadEventLog$(fileList[0]).subscribe(() => {
        console.log('success?');
      });*/
      this.backendService.loadEventLogFromFilePath(fileList[0]['path']).subscribe(res => {
        // console.log('Event log ' + fileName + ' loaded');
        this.backgroundTaskInfoService.removeTask(taskDescription);
        this.sharedDataService.loadedEventLog = fileName;
      });
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
}
