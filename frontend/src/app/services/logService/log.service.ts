import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TimeUnit } from 'src/app/objects/TimeUnit';
import { mapVariants } from 'src/app/utils/util';
import { SharedDataService } from '../sharedDataService/shared-data.service';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  backendUrl = 'http://127.0.0.1:41211/';

  constructor(
    private httpClient: HttpClient,
    private sharedDataService: SharedDataService
  ) {}

  public getProperties(timeGranularity?: TimeUnit): Observable<any> {
    return this.httpClient
      .post(this.backendUrl + 'log/properties', {
        timeGranularity: timeGranularity,
      })
      .pipe(mapVariants());
  }

  public getEventLog(): Observable<any> {
    return this.httpClient.get(this.backendUrl + 'log');
  }

  /**
   * Fetches the properties of the log that is currently cached in the backend.
   * If no time granularity is provided the granularity of the log is computed in
   * the backend.
   * @param timeGranularity
   * @param logName
   */
  public getLogPropsAndUpdateState(
    timeGranularity?: TimeUnit,
    logName?: string
  ): Observable<any> {
    return this.getProperties(timeGranularity).pipe(
      tap((properties) => {
        this.updateState(properties, logName);
      })
    );
  }

  /**
   * Updates the properties in sharedDataService (variants, activities, logName)
   * @param properties
   * @param logName
   */
  private updateState(properties: any, logName: string) {
    this.sharedDataService.activitiesInEventLog = properties['activities'];
    this.sharedDataService.startActivitiesInEventLog = new Set(
      Object.keys(properties['startActivities'])
    );
    this.sharedDataService.endActivitiesInEventLog = new Set(
      Object.keys(properties['endActivities'])
    );
    this.sharedDataService.variants = properties['variants'];
    this.sharedDataService.loadedEventLog = logName;
  }

  public getLogGranularity(): Observable<TimeUnit> {
    return this.httpClient.get<TimeUnit>(this.backendUrl + 'log/granularity');
  }

  public resetLogCache(): Observable<any> {
    return this.httpClient.get(this.backendUrl + 'log/resetLogCache');
  }
}
