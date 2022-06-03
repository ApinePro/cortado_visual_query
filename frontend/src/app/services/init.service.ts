import { Injectable } from '@angular/core';
import { delay, retryWhen, take } from 'rxjs/operators';
import { BackendService } from './backendService/backend.service';

export function initApp(initService: InitService) {
  return (): Promise<any> => {
    return initService.init();
  };
}

@Injectable({
  providedIn: 'root',
})
export class InitService {
  constructor(private backendService: BackendService) {}

  init() {
    return this.backendService
      .getInfo()
      .pipe(retryWhen((errors) => errors.pipe(delay(500), take(100))))
      .toPromise();
  }
}
