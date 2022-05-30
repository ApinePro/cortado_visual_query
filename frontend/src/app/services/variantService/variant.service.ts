
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Variant } from 'src/app/components/variant-explorer/model';
import * as dummyBackendResponse from '../SharedDataService/dummy_backend_response.js';

@Injectable({
  providedIn: 'root'
})
export class VariantService {

  constructor() { }

  private _variants = new BehaviorSubject<Variant[]>(
    dummyBackendResponse.variant
  );

  get variants$(): Observable<Variant[]> {
    return this._variants.asObservable();
  }

  set variants(activities: Variant[]) {
    this._variants.next(activities);
  }

  get variants(): Variant[] {
    return this._variants.getValue();
  }
}
