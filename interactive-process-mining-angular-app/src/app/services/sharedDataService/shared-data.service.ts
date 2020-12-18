import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from "rxjs";

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
  private _currentDisplayedProcessTree = new BehaviorSubject<any>(null);

  get currentDisplayedProcessTree$(): Observable<string> {
    return this._currentDisplayedProcessTree.asObservable();
  }

  set currentDisplayedProcessTree(tree: any) {
    console.log("currentDisplayedProcessTree is SHARED_DATA_SERVICE has changed");
    this._currentDisplayedProcessTree.next(tree);
    this._activitiesInCurrentTree.next(this.getListOfActivities(tree));
  }

  getListOfActivities(tree: any): Set<string> {
    let res: Set<string> = new Set();
    if (tree.children && tree.children.length > 0) {
      tree.children.forEach(c => {
        res = new Set([...res, ...this.getListOfActivities(c)])
      });
    } else if (tree.label) {
      res.add(tree.label);
    }
    return res;
  }

  private _activitiesInCurrentTree = new Subject<Set<string>>();

  get activitiesInCurrentTree$(): Observable<Set<string>> {
    return this._activitiesInCurrentTree.asObservable();
  }

  private _eventLogVariants = new Subject<any>();

  get eventLogVariants(): Observable<any> {
    return this._eventLogVariants.asObservable();
  }


}

