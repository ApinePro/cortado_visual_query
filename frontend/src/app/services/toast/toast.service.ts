import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ToastEvent } from 'src/app/objects/toast-event';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toastEvents: Observable<ToastEvent>;
  private _toastEvents = new Subject<ToastEvent>();
  defaultDelay = 5000;
  defaultAutoclose = true;

  constructor() {
    this.toastEvents = this._toastEvents.asObservable();
  }

  showToast(title: string, body: string, icon: string) {
    this.showToastWithOptions(
      title,
      body,
      this.defaultDelay,
      this.defaultAutoclose,
      icon
    );
  }

  showToastWithOptions(
    title: string,
    body: string,
    delay: number,
    autoclose: boolean,
    icon: string
  ) {
    this._toastEvents.next({
      title,
      body,
      delay,
      autoclose,
      icon,
    });
  }
}
