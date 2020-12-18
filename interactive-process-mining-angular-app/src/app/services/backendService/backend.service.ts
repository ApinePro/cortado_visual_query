import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {SharedDataService} from "../sharedDataService/shared-data.service";
import * as FileSaver from 'file-saver';
import {take} from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private httpClient: HttpClient, private sharedDataService: SharedDataService) {
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
      {'file_path': filePath});
  }

  getVariantsFromEventLog(): Observable<any> {
    return this.httpClient.get(this.backendUrl + 'variants');
  }

  discoverProcessModelFromVariants(variants: any[]) {
    this.httpClient.post(this.backendUrl + 'discoverProcessModelFromVariants', {'variants': variants}).subscribe(res => {
      this.sharedDataService.currentDisplayedProcessTree = res;
    });
  }

  downloadCurrentTreeAsPTML() {
    this.sharedDataService.currentDisplayedProcessTree$.pipe(take(1)).subscribe(tree => {
      this.httpClient.post(this.backendUrl + 'convertPtToPTML', {pt: tree}, {responseType: 'blob'})
        .subscribe(blob => {
          FileSaver.saveAs(blob, 'process_tree.ptml');
        });
    });
  }

  downloadCurrentTreeAsPNML() {
    this.sharedDataService.currentDisplayedProcessTree$.pipe(take(1)).subscribe(tree => {
      this.httpClient.post(this.backendUrl + 'convertPtToPNML', {pt: tree}, {responseType: 'blob'})
        .subscribe(blob => {
          FileSaver.saveAs(blob, 'petri_net.pnml');
        });
    });
  }

}

