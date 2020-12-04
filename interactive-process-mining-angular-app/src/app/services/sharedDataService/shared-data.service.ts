import {Injectable} from '@angular/core';
import {Observable, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  constructor() {
  }

  // tslint:disable-next-line:variable-name
  private _loadedEventLog = new Subject<string>();

  get loadedEventLog$(): Observable<string> {
    return this._loadedEventLog.asObservable();
  }

  set loadedEventLog(name: string) {
    this._loadedEventLog.next(name);
  }


  // tslint:disable-next-line:variable-name
  private _currentDisplayedProcessTree = new Subject<any>();

  get currentDisplayedProcessTree$(): Observable<string> {
    return this._currentDisplayedProcessTree.asObservable();
  }

  set currentDisplayedProcessTree(tree: any) {
    this._currentDisplayedProcessTree.next(tree);
  }
}

