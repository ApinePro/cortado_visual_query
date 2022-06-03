import { Injectable } from '@angular/core';

export function initApp(initService: InitService) {
  return (): Promise<any> => {
    return initService.init();
  };
}

@Injectable({
  providedIn: 'root',
})
export class InitService {
  constructor() {}

  init() {
    // put logic here that should be executed before the
    // root component is initialized
    return Promise.resolve();
  }
}
