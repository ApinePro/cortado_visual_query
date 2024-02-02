import { Injectable } from '@angular/core';
import { ElectronInterface } from './electron-interface';
import { Subject } from 'rxjs';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class ElectronDummyService implements ElectronInterface {
  constructor() {}

  checkUnsavedChanges$: Subject<any>;
  saveProject$: Subject<any>;

  showSaveDialog(
    fileName: string,
    fileExtension: string,
    blob: Blob,
    buttonLabel: string,
    title: string
  ): Promise<string> {
    saveAs(blob, fileName + '.' + fileExtension);
    return null;
  }
  saveToUserFolder(
    fileName: string,
    fileExtension: string,
    data: string
  ): Promise<undefined> {
    throw new Error('Method not implemented.');
  }
  readFromUserFolder(fileName: string, fileExtension: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  getWSPort(): Promise<number> {
    return Promise.resolve(0);
  }
}
