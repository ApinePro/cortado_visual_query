import { Injectable, isDevMode } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ProcessTree } from 'src/app/objects/ProcessTree';
import * as dummyBackendResponse from './dummy_backend_response.js';
import { Variant } from '../../components/variant-explorer/model';
import { dummy_tree } from './debug_tree.js';

@Injectable({
  providedIn: 'root',
})
export class SharedDataService {

  constructor() {}

  public computedTextLengthCache = new Map<string, number>();
  public performanceInfoAvailable = false;

  private _loadedEventLog = new Subject<string>();
  private _treePerformance = new BehaviorSubject<Object>({});
  private _activityNamesChanged = new BehaviorSubject<Map<string, string>>(
    null
  );

  get activityNamesChanged$(): Observable<Map<string, string>> {
    return this._activityNamesChanged.asObservable();
  }

  set activityNamesChanged(activityNameMapping: Map<string, string>) {
    console.log('Activity names have been changed');
    console.log(activityNameMapping);
    this._activityNamesChanged.next(activityNameMapping);
  }

  get loadedEventLog$(): Observable<string> {
    return this._loadedEventLog.asObservable();
  }

  set loadedEventLog(name: string) {
    console.log('set loadedEventLog:' + name);
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
    console.log(
      'currentDisplayedProcessTree in SHARED_DATA_SERVICE has changed'
    );
    if (tree && !(tree instanceof ProcessTree)) {
      tree = ProcessTree.fromObj(tree);
    }
    this._currentDisplayedProcessTree.next(tree);
    this._activitiesInCurrentTree.next(this.getSetOfActivities(tree));
  }

  get treePerformance$(): Observable<Object> {
    return this._treePerformance.asObservable();
  }

  get treePerformance(): Object {
    return this._treePerformance.getValue();
  }

  set treePerformance(performance) {
    this._treePerformance.next(performance);
  }

  private getSetOfActivities(tree: any): Set<string> {
    if (tree) {
      let res: Set<string> = new Set();
      if (tree.children && tree.children.length > 0) {
        tree.children.forEach((c) => {
          res = new Set([...res, ...this.getSetOfActivities(c)]);
        });
      } else if (tree.label) {
        res.add(tree.label);
      }
      return res;
    } else {
      return new Set();
    }
  }

  private _activitiesInCurrentTree = new BehaviorSubject<Set<string>>(
    new Set()
  );

  get activitiesInCurrentTree$(): Observable<Set<string>> {
    return this._activitiesInCurrentTree.asObservable();
  }

  private _activitiesInEventLog = new BehaviorSubject<any>(
    dummyBackendResponse.activitiesInLog
  );

  get activitiesInEventLog$(): Observable<any> {
    return this._activitiesInEventLog.asObservable();
  }

  set activitiesInEventLog(activities: any) {
    this._activitiesInEventLog.next(activities);
  }

  get activitiesInEventLog(): any {
    return this._activitiesInEventLog.getValue();
  }

  private _startActivitiesInEventLog = new BehaviorSubject<Set<string>>(
    dummyBackendResponse.startActivities
  );

  get startActivitiesInEventLog$(): Observable<Set<string>> {
    return this._startActivitiesInEventLog.asObservable();
  }

  set startActivitiesInEventLog(activities: Set<string>) {
    this._startActivitiesInEventLog.next(activities);
  }

  get startActivitiesInEventLog(): Set<string> {
    return this._startActivitiesInEventLog.getValue();
  }

  private _endActivitiesInEventLog = new BehaviorSubject<Set<string>>(
    dummyBackendResponse.endActivities
  );

  get endActivitiesInEventLog$(): Observable<Set<string>> {
    return this._endActivitiesInEventLog.asObservable();
  }

  set endActivitiesInEventLog(activities: Set<string>) {
    this._endActivitiesInEventLog.next(activities);
  }

  get endActivitiesInEventLog(): Set<string> {
    return this._endActivitiesInEventLog.getValue();
  }

  private _variants = new BehaviorSubject<Variant[]>(
    dummyBackendResponse.variant
  );

  get variants$(): Observable<Variant[]> {
    return this._variants.asObservable();
  }

  set variants(activities: Variant[]) {
    this._variants.next(activities);
  }

  get variants(): Variant[] {
    return this._variants.getValue();
  }

  private _correctTreeSyntax = new BehaviorSubject<boolean>(false);

  get correctTreeSyntax$(): Observable<boolean> {
    return this._correctTreeSyntax.asObservable();
  }

  set correctTreeSyntax(flag: boolean) {
    this._correctTreeSyntax.next(flag);
  }

  get correctTreeSyntax(): boolean {
    return this._correctTreeSyntax.getValue();
  }

  private _selectedRootNodeID = new BehaviorSubject<number>(null);

  get selectedRootNodeID$(): Observable<number> {
    return this._selectedRootNodeID.asObservable();
  }

  set selectedRootNodeID(node: number) {
    this._selectedRootNodeID.next(node);
  }

  get selectedRootNodeID(): number {
    return this._selectedRootNodeID.getValue();
  }

  private _frequentMiningResults = new BehaviorSubject<Array<any>>(null);

  get frequentMiningResults$(): Observable<Array<any>> {
    return this._frequentMiningResults.asObservable();
  }

  set frequentMiningResults(res: Array<any>) {
    this._frequentMiningResults.next(res);
  }

  private _currentTreeString = new BehaviorSubject<string>('');

  get currentTreeString$(): Observable<string> {
    return this._currentTreeString.asObservable();
  }

  set currentTreeString(syntaxObj: any) {
    this._currentTreeString.next(syntaxObj);
  }

  get currentTreeString() {
    return this._currentTreeString.getValue();
  }

  private _nodeWidthCache = new BehaviorSubject<Map<string, number>>(null);

  get nodeWidthCache$(): Observable<Map<string, number>> {
    return this._nodeWidthCache.asObservable();
  }

  get nodeWidthCache() {
    return this._nodeWidthCache.getValue();
  }

  set nodeWidthCache(map: Map<string, number>) {
    this._nodeWidthCache.next(map);
  }

  // TODO move somewhere else
  processTreesEqual(pt1, pt2): boolean {
    if (!pt1 || !pt2) {
      return false;
    }
    if (
      pt1['operator'] === pt2['operator'] &&
      pt1['label'] === pt2['label'] &&
      pt1['children'].length === pt2['children'].length
    ) {
      if (pt1['children'].length === 0) {
        return true;
      } else {
        let res = true;
        for (let i = 0; i < pt1['children'].length; i++) {
          res =
            res &&
            this.processTreesEqual(pt1['children'][i], pt2['children'][i]);
        }
        return res;
      }
    } else {
      return false;
    }
  }
}
