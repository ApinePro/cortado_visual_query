import {Injectable, isDevMode} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  constructor() {
    if (isDevMode()) {
      console.log("load dummy data to activity list")
      this._activitiesInEventLog.next(new Set([
        "register request",
        "examine thoroughly",
        "examine casually",
        "check ticket",
        "decide",
        "reinitiate request",
        "pay compensation",
        "reject request",
      ]));
    }
  }

  private _loadedEventLog = new Subject<string>();

  get loadedEventLog$(): Observable<string> {
    return this._loadedEventLog.asObservable();
  }

  set loadedEventLog(name: string) {
    this._loadedEventLog.next(name);
  }

  private _currentDisplayedProcessTree = new BehaviorSubject<any>(null);

  get currentDisplayedProcessTree$(): Observable<any> {
    return this._currentDisplayedProcessTree.asObservable();
  }

  get currentDisplayedProcessTree(): any {
    return this._currentDisplayedProcessTree.getValue();
  }

  set currentDisplayedProcessTree(tree: any) {
    console.log("currentDisplayedProcessTree is SHARED_DATA_SERVICE has changed");
    this._currentDisplayedProcessTree.next(tree);
    this._activitiesInCurrentTree.next(this.getSetOfActivities(tree));
  }

  private getSetOfActivities(tree: any): Set<string> {
    let res: Set<string> = new Set();
    if (tree.children && tree.children.length > 0) {
      tree.children.forEach(c => {
        res = new Set([...res, ...this.getSetOfActivities(c)])
      });
    } else if (tree.label) {
      res.add(tree.label);
    }
    return res;
  }

  private _activitiesInCurrentTree = new BehaviorSubject<Set<string>>(undefined);

  get activitiesInCurrentTree$(): Observable<Set<string>> {
    return this._activitiesInCurrentTree.asObservable();
  }

  private _activitiesInEventLog = new BehaviorSubject<Set<string>>(undefined);

  get activitiesInEventLog$(): Observable<Set<string>> {
    return this._activitiesInEventLog.asObservable();
  }

  set activitiesInEventLog(activities: Set<string>) {
    this._activitiesInEventLog.next(activities);
  }

  private _eventLogVariants = new Subject<any>();

  get eventLogVariants(): Observable<any> {
    return this._eventLogVariants.asObservable();
  }

  // TODO move somewhere else
  processTreesEqual(pt1, pt2): boolean {
    if (!pt1 || !pt2) {
      return false;
    }
    if (pt1['operator'] === pt2['operator'] &&
      pt1['label'] === pt2['label'] &&
      pt1['children'].length === pt2['children'].length) {
      if (pt1['children'].length === 0) {
        return true;
      } else {
        let res = true;
        for (let i = 0; i < pt1['children'].length; i++) {
          res = res && this.processTreesEqual(pt1['children'][i], pt2['children'][i]);
        }
        return res;
      }
    } else {
      return false;
    }
  }
}

