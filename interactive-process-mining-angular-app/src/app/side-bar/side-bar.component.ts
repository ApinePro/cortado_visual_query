import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
  }

  @ViewChild('fileUploadEventLog') fileUploadEventLog: ElementRef;

  importEventLog() {
    this.fileUploadEventLog.nativeElement.click();
  }

  handleSelectedFile(e) {
    console.log('Change input file')
    console.log(e)
    const fileList: FileList = e.target.files;
    if (fileList.length > 0) {
      let formData:FormData = new FormData();
    }
  }

}
