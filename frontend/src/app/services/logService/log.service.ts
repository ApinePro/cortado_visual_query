import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { deserialize } from 'src/app/components/variant-explorer/model';
import { SharedDataService } from '../sharedDataService/shared-data.service';
import * as objectHash from 'object-hash';
import { TimeUnit } from 'src/app/objects/TimeUnit';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  backendUrl = 'http://127.0.0.1:41211/';

  constructor(
    private httpClient: HttpClient,
    private sharedDataService: SharedDataService
  ) {}

  public getProperties(parameters): Observable<any> {
    return this.httpClient.post(this.backendUrl + 'log/properties', parameters);
  }

  public getEventLog(): Observable<any> {
    return this.httpClient.get(this.backendUrl + 'log');
  }

  public getLogPropsAndUpdateState(parameters): Observable<any> {
    return this.getProperties(parameters).pipe(
      tap((properties) => {
        this.sharedDataService.variants = properties['variants'];

        this.sharedDataService.variants.forEach((variant, i) => {
          variant['id'] = objectHash(variant['variant']);
          variant.number = i + 1;
          variant['variant'] = deserialize(variant.variant);
        });
        // TODO changing loadedEventLog name triggers the changes in frontend
        this.sharedDataService.loadedEventLog = 'event-log';
        this.sharedDataService.performanceInfoAvailable = true;
      })
    );
  }

  public getLogGranularity(): Observable<TimeUnit> {
    return this.httpClient.get<TimeUnit>(this.backendUrl + 'log/granularity');
  }
}
