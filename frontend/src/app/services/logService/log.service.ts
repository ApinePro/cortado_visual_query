import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TimeUnit } from 'src/app/objects/TimeUnit';
import * as dummyBackendResponse from 'src/app/services/SharedDataService/dummy_backend_response.js';
import { mapVariants } from 'src/app/utils/util';


@Injectable({
  providedIn: 'root',
})
export class LogService {
  constructor(
  ) {}

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

  private _loadedEventLog = new BehaviorSubject<string>('preload');

  get loadedEventLog$(): Observable<string> {
    return this._loadedEventLog.asObservable();
  }

  set loadedEventLog(name: string) {
    this._loadedEventLog.next(name);
  }

  private _activitiesInEventLog = new BehaviorSubject<Set<string>>(
    dummyBackendResponse.activitiesInLog
  );

  get activitiesInEventLog$(): Observable<any> {
    return this._activitiesInEventLog.asObservable();
  }

  set activitiesInEventLog(activities: any) {
    this._activitiesInEventLog.next(activities);
  }

  get activitiesInEventLog():any {
    return this._activitiesInEventLog.getValue();
  }

  public deleteActivityInEventLog(activityName : string) : any {
    this.activitiesInEventLog.delete(activityName)
  }

  public renameActivitiesInEventLog(activityName : string, newActivityName : string) : any {

   // modifying related data in shared data service. Similar to processEventLog in backend service
   // relabeling activities

   let activityNameMapping: Map<string, string> = new Map();
    for (let activity in this.activitiesInEventLog) {
       activityNameMapping.set(
        activity,
        activity
      );
    }

  activityNameMapping.set(activityName, newActivityName);
  console.log(activityNameMapping)

  let activities = {};
  for (let activity in this.activitiesInEventLog) {
    let newActivityName = activityNameMapping.get(activity);
    if (!activities[newActivityName]) {
      activities[newActivityName] =
        this.activitiesInEventLog[activity];

    } else {
      activities[newActivityName] +=
        this.activitiesInEventLog[activity];
    }
  }

  console.log(this.activitiesInEventLog)

  if(this.endActivitiesInEventLog.delete(activityName)) this.endActivitiesInEventLog.add(newActivityName);
  if(this.startActivitiesInEventLog.delete(activityName)) this.startActivitiesInEventLog.add(newActivityName);

  this.activitiesInEventLog = activities

  }

  public get timeGranularity$(): Observable<TimeUnit> {
    return this._timeGranularity.asObservable();
  }
  public set timeGranularity(value: TimeUnit) {
    this._timeGranularity.next(value);
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


}
