import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {BackgroundTaskInfoService} from "../backgroundTaskInfoService/background-task-info.service";

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private httpClient: HttpClient) {
  }

  backendUrl = 'http://127.0.0.1:8000/'

  uploadEventLogFilePath$(file: File): Observable<boolean> {
    console.log('uploadEventLog()');
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    // @ts-ignore
    return this.httpClient
      .post(this.backendUrl + 'uploadfile', formData, {headers: {}})
  }

  loadEventLogFromFilePath(filePath: string): Observable<any> {
    return this.httpClient.post(this.backendUrl + 'loadEventLogFromFilePath',
      {'file_path': filePath}, {headers: {}});
  }

  getVariantsFromEventLog(): Observable<any> {
    return this.httpClient.get(this.backendUrl + 'variants');
  }

}

