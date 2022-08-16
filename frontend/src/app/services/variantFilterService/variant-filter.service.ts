import { LogService } from './../logService/log.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { VariantService } from '../variantService/variant.service';

@Injectable({
  providedIn: 'root'
})
export class VariantFilterService {

  private _variantFilters : BehaviorSubject<Map<string, Set<number>>> = new BehaviorSubject<Map<string, Set<number>>>(new  Map<string, Set<number>>() );

  get variantFilters$(): Observable<Map<string, Set<number>>> {
    return this._variantFilters.asObservable();
  }

  set variantFilters(filters: Map<string, Set<number>>) {
    this._variantFilters.next(filters);
  }

  get variantFilters() {
    return this._variantFilters.value
  }

  constructor(
    ) {}

  addVariantFilter(filter_name : string, bids : Set<number>){

    const newFilterMap = new  Map<string, Set<number>>(this.variantFilters);
    newFilterMap.set(filter_name, bids)

    this.variantFilters = newFilterMap

  }


  removeVariantFilter(filter_name){

    const newFilterMap = new  Map<string, Set<number>>(this.variantFilters);
    newFilterMap.delete(filter_name);
    this.variantFilters = newFilterMap

  }


  clearAllFilters(){
    const newFilterMap = new  Map<string, Set<number>>(this.variantFilters);
    this.variantFilters = newFilterMap
  }






}
