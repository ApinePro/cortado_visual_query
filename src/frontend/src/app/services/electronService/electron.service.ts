import { Injectable } from '@angular/core';
import { blobToBase64 } from 'src/app/utils/util';
import { ProjectService } from '../projectService/project.service';
import { Subject } from 'rxjs';
import { ElectronInterface } from './electron-interface';

@Injectable()
export class ElectronService implements ElectronInterface {
  private electronApi = (<any>window).electronAPI;

  public checkUnsavedChanges$ = new Subject<any>();
  public saveProject$ = new Subject<any>();

  constructor() {
    this.electronApi?.onCheckUnsavedChanges((event, value) =>
      this.checkUnsavedChanges$.next(event.sender),
    );

    this.electronApi?.onSaveProject((event, value) =>
      this.saveProject$.next(event.sender),
    );
  }

  public async showSaveDialog(
    fileName: string,
    fileExtension: string,
    blob: Blob,
    buttonLabel: string,
    title: string,
  ): Promise<string> {
    let base64File = await blobToBase64(blob);

    // returns filePath of savedFile or undefined if aborted
    return this.electronApi.showSaveDialog(
      fileName,
      fileExtension,
      base64File,
      buttonLabel,
      title,
    );
  }

  public saveToUserFolder(
    fileName: string,
    fileExtension: string,
    data: string,
  ): Promise<undefined> {
    return this.electronApi.saveToUserFolder(fileName, fileExtension, data);
  }

  public readFromUserFolder(
    fileName: string,
    fileExtension: string,
  ): Promise<string> {
    return this.electronApi.readFromUserFolder(fileName, fileExtension);
  }
}
