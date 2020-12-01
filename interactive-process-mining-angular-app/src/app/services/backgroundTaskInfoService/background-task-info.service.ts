import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class BackgroundTaskInfoService {

  constructor() {
  }

  private currentBackgroundTask = new BehaviorSubject<string>(undefined)

  public setNewTask(description: string) {
    this.currentBackgroundTask.next(description);
  }

  removeTask(description: string) {
    if (this.getCurrentTask() === description) {
      this.currentBackgroundTask.next(undefined);
    }
  }

  private getCurrentTask(): string {
    return this.currentBackgroundTask.getValue();
  }

  public currentBackgroundTask$(): Observable<string> {
    return this.currentBackgroundTask.asObservable();
  }
}
