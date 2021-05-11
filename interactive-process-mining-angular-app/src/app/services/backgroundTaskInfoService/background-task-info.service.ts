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

  public setRequest(description: string): number {
    const id = Math.random();
    this.activeRequests.set(id, description);
    this.currentBackgroundTask.next(this.activeRequests.values().next().value);
    return id;
  }

  public removeRequest(id: number): void {
    this.activeRequests.delete(id);
    this.currentBackgroundTask.next(this.activeRequests.values().next().value);
  }

  public currentBackgroundTask$(): Observable<string> {
    return this.currentBackgroundTask.asObservable();
  }
}
