import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocalProcessModelWithPatterns } from 'src/app/objects/LocalProcessModelWithPatterns';

@Injectable({
  providedIn: 'root',
})
export class LpmService {
  private _localProcessModels = new BehaviorSubject<
    LocalProcessModelWithPatterns[]
  >([]);

  set localProcessModels(lpms: LocalProcessModelWithPatterns[]) {
    this._localProcessModels.next(lpms);
  }

  get localProcessModels$(): Observable<LocalProcessModelWithPatterns[]> {
    return this._localProcessModels.asObservable();
  }
}
