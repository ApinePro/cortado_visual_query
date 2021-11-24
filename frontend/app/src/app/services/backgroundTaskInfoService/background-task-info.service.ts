import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackgroundTaskInfoService {

  constructor() {
  }

  activeRequests = new Map();

  private currentBackgroundTask = new BehaviorSubject<string>(undefined);

  private numberBackgroundTask = new BehaviorSubject<number>(0);

  public setRequest(description: string): number {
    const id = Math.random();
    this.activeRequests.set(id, description);
    this.currentBackgroundTask.next(this.activeRequests.values().next().value);
    this.numberBackgroundTask.next(this.numberBackgroundTask.getValue() + 1);
    return id;
  }

  public removeRequest(id: number): void {
    this.activeRequests.delete(id);
    this.currentBackgroundTask.next(this.activeRequests.values().next().value);
    this.numberBackgroundTask.next(this.numberBackgroundTask.getValue() - 1);
  }

  public currentBackgroundTask$(): Observable<string> {
    return this.currentBackgroundTask.asObservable();
  }

  public numberBackgroundTasks$(): Observable<number> {
    return this.numberBackgroundTask.asObservable();
  }
}
