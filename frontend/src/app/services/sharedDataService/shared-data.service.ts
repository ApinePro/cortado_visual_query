import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { TimeUnit } from 'src/app/objects/TimeUnit';

@Injectable({
  providedIn: 'root',
})
export class SharedDataService {
  constructor() {}

  public computedTextLengthCache = new Map<string, number>();
  public performanceInfoAvailable = false;

  private _treePerformance = new BehaviorSubject<Object>({});

  get treePerformance$(): Observable<Object> {
    return this._treePerformance.asObservable();
  }

  get treePerformance(): Object {
    return this._treePerformance.getValue();
  }

  set treePerformance(performance) {
    this._treePerformance.next(performance);
  }
}
