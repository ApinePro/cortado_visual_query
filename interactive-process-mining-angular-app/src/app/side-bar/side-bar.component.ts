import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {BackendService} from "../services/backendService/backend.service";

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {

  constructor(private backendService: BackendService) {
  }

  ngOnInit(): void {
  }

  @ViewChild('fileUploadEventLog') fileUploadEventLog: ElementRef;

  importEventLog() {
    console.log('file upload click');
    this.fileUploadEventLog.nativeElement.click();
  }

  handleSelectedFile(e) {
    console.log('Change input file')
    console.log(e)
    const fileList: FileList = e.target.files;
    if (fileList.length > 0) {
      console.log(fileList[0]);
      //TODO make it also work with browser by uploading the file instead of just the file path
      /*this.backendService.uploadEventLog$(fileList[0]).subscribe(() => {
        console.log('success?');
      });*/
      this.backendService.loadEventLogFromFilePath(fileList[0]['path']).subscribe(res => {
        console.log('success?');
      })
    }
    // reset form
    this.fileUploadEventLog.nativeElement.value = '';
  }

}
