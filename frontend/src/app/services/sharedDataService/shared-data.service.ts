import { Injectable, isDevMode } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as dummyBackendResponse from './dummy_backend_response.js';
import { Variant } from '../../components/variant-explorer/model';
import { dummy_tree } from './debug_tree.js';
import { TimeUnit } from 'src/app/objects/TimeUnit';
import { skip } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SharedDataService {
  constructor() {}

  public computedTextLengthCache = new Map<string, number>();
  public performanceInfoAvailable = false;
  private _timeGranularity: Subject<TimeUnit> = new Subject();
  private _logGranularity: BehaviorSubject<TimeUnit> = new BehaviorSubject(
    TimeUnit.SEC
  );
  public get logGranularity$(): Observable<TimeUnit> {
    return this._logGranularity.asObservable();
  }
  public set logGranularity(value: TimeUnit) {
    this._logGranularity.next(value);
  }

  private _loadedEventLog = new BehaviorSubject<string>('');
  private _treePerformance = new BehaviorSubject<Object>({});
  private _activityNamesChanged = new BehaviorSubject<Map<string, string>>(
    null
  );

  get activityNamesChanged$(): Observable<Map<string, string>> {
    return this._activityNamesChanged.asObservable();
  }

  set activityNamesChanged(activityNameMapping: Map<string, string>) {
    this._activityNamesChanged.next(activityNameMapping);
  }

  get loadedEventLog$(): Observable<string> {
    return this._loadedEventLog.asObservable().pipe(skip(1));
  }

  get loadedEventLog(): string {
    return this._loadedEventLog.value;
  }

  set loadedEventLog(name: string) {
    this._loadedEventLog.next(name);
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

  private _activitiesInCurrentTree = new BehaviorSubject<Set<string>>(
    new Set()
  );

  get activitiesInCurrentTree$(): Observable<Set<string>> {
    return this._activitiesInCurrentTree.asObservable();
  }

  set activitiesInCurrentTree(activities) {
    this._activitiesInCurrentTree.next(activities);
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

  private _variants = new BehaviorSubject<Variant[]>([]);

  get variants$(): Observable<Variant[]> {
    return this._variants.asObservable().pipe(skip(1)); // skip initial empty array
  }

  set variants(activities: Variant[]) {
    this._variants.next(activities);
  }

  get variants(): Variant[] {
    return this._variants.getValue();
  }

  public get timeGranularity$(): Observable<TimeUnit> {
    return this._timeGranularity.asObservable();
  }
  public set timeGranularity(value: TimeUnit) {
    this._timeGranularity.next(value);
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
