
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { deserialize } from 'src/app/components/variant-explorer/model';
import * as objectHash from 'object-hash';
import { TimeUnit } from 'src/app/objects/TimeUnit';
import * as dummyBackendResponse from 'src/app/services/SharedDataService/dummy_backend_response.js';
import { VariantService } from '../variantService/variant.service';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  backendUrl = 'http://127.0.0.1:41211/';

  constructor(
    private httpClient: HttpClient,
    private variantService : VariantService
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

  public deleteActivityFromEventLog(activityName : string) : any {

  }

  public renameActivityFromEventLog(activityName : string, newActivityName : string) : any {

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


  public getProperties(parameters): Observable<any> {
    return this.httpClient.post(this.backendUrl + 'log/properties', parameters);
  }

  public getEventLog(): Observable<any> {
    return this.httpClient.get(this.backendUrl + 'log');
  }

  public getLogPropsAndUpdateState(parameters): Observable<any> {
    return this.getProperties(parameters).pipe(
      tap((properties) => {
        this.variantService.variants = properties['variants'];

        this.variantService.variants.forEach((variant, i) => {
          variant['id'] = objectHash(variant['variant']);
          variant.number = i + 1;
          variant['variant'] = deserialize(variant.variant);
        });
        // TODO changing loadedEventLog name triggers the changes in frontend
        this.loadedEventLog = 'event-log';
        this.performanceInfoAvailable = true;
      })
    );
  }

  public getLogGranularity(): Observable<TimeUnit> {
    return this.httpClient.get<TimeUnit>(this.backendUrl + 'log/granularity');
  }

  propagateActivityNameChange(activityName, newActivityName) {
    console.log('Propangating Change', activityName, newActivityName);

    this.httpClient
      .post(this.backendUrl + 'modifylog/' + 'changeActivityName', {
        activityName: activityName,
        newActivityName: newActivityName,
      })
      .subscribe((t) => console.log('Send', t));
  }

  propagateActivityDeletion(activityName) {
    this.httpClient
      .post(this.backendUrl + 'modifylog/' + 'deleteActivity', {
        activityName: activityName,
      })
      .subscribe((res) =>
        this.processEventLog(res, this.loadedEventLog)
      );
  }

  revertChangeInBackend() {
    this.httpClient.post(
      this.backendUrl + 'modifylog/' + 'revertLastChange',
      {}
    );
  }

  private processEventLog(res, filePath = null) {
    this.activitiesInEventLog = res['activities'];
    this.startActivitiesInEventLog = new Set(
      Object.keys(res['startActivities'])
    );
    this.endActivitiesInEventLog = new Set(
      Object.keys(res['endActivities'])
    );

    this.variantService.variants = res['variants'];

    this.variantService.variants.forEach((variant, i) => {
      variant['id'] = objectHash(variant['variant']);
      variant.number = i + 1;
      variant['variant'] = deserialize(variant.variant);
    });

    this.loadedEventLog = filePath;

    this.performanceInfoAvailable = true;
    this.timeGranularity = res['timeGranularity'];
    this.logGranularity = res['timeGranularity'];
  }
}
