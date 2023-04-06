import { Injectable } from '@angular/core';
import { blobToBase64 } from 'src/app/utils/util';

@Injectable()
export class ElectronService implements ElectronServiceInterface {
  private electronApi = (<any>window).electronAPI;

  constructor() {}

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
  showSaveDialog(
    fileName: string,
    fileExtension: string,
    blob: Blob,
    buttonLabel: string,
    title: string
  ): Promise<string>;
}
