import { Injectable } from '@angular/core';
import { blobToBase64 } from 'src/app/utils/util';
import { ProjectService } from '../projectService/project.service';
import { Subject } from 'rxjs';

@Injectable()
export class ElectronService implements ElectronServiceInterface {
  private electronApi = (<any>window).electronAPI;

  public checkUnsavedChanges$ = new Subject();
  public saveProject$ = new Subject();

  constructor() {
    this.electronApi?.onCheckUnsavedChanges((event, value) =>
      this.checkUnsavedChanges$.next(event.sender)
    );

    this.electronApi?.onSaveProject((event, value) =>
      this.saveProject$.next(event.sender)
    );
  }

  public async showSaveDialog(
    fileName: string,
    fileExtension: string,
    blob: Blob,
    buttonLabel: string,
    title: string
  ): Promise<string> {
    let base64File = await blobToBase64(blob);

    // returns filePath of savedFile or undefined if aborted
    return this.electronApi.showSaveDialog(
      fileName,
      fileExtension,
      base64File,
      buttonLabel,
      title
    );
  }
}

export interface ElectronServiceInterface {
  checkUnsavedChanges$: Subject<any>;
  saveProject$: Subject<any>;

  showSaveDialog(
    fileName: string,
    fileExtension: string,
    blob: Blob,
    buttonLabel: string,
    title: string
  ): Promise<string>;
}
