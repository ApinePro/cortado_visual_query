import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';
import { ProcessTreeService } from 'src/app/services/processTreeService/process-tree.service';
import { LogService } from 'src/app/services/logService/log.service';
import * as objectHash from 'object-hash';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Variant, VariantElement, InfixType } from 'src/app/components/variant-explorer/model';
import * as dummyBackendResponse from '../SharedDataService/dummy_backend_response.js';

@Injectable({
  providedIn: 'root'
})
export class VariantService {

  constructor(private logService : LogService, private processTreeService : ProcessTreeService, private colorMapService : ColorMapService) { }

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




  public deleteActivity(activityName : string){

    const fallthrough = []
    const updateMap : Map<string, Variant[]> = new Map<string, Variant[]>();

    for(let variant of this.variants){

      if (variant.variant.getActivities().has(activityName)){
        const res = variant.variant.deleteActivity(activityName);

        if (res[1]){
          fallthrough.push(variant);
          continue; 
        } 

      }


      const tmp = variant.variant.asString(); 

      if (updateMap.has(tmp)){
        updateMap.get(tmp).push(variant)
      } else {
        updateMap.set(tmp, [variant])
      }
      

    }


  }


  public renameActivity(activityName : string, newActivityName : string){
    const updateMap : Map<string, Variant[]> = new Map<string, Variant[]>();

    for(let variant of this.variants){

          if (variant.variant.getActivities().has(activityName)){
            variant.variant.renameActivity(activityName, newActivityName);
          }


          const tmp = variant.variant.asString(); 

          if (updateMap.has(tmp)){
            updateMap.get(tmp).push(variant)
          } else {
            updateMap.set(tmp, [variant])
          }
          

    }
    
    const total = this.variants.map((v) => v.count).reduce((a, b) => a + b);
    this.colorMapService.renameColorInActivityColorMap(activityName, newActivityName); 
    this.logService.renameActivitiesInEventLog(activityName, newActivityName);
    this.processTreeService.renameActivityInProcessTree(activityName, newActivityName); 

    
    const variants : Variant[] = [];  
    console.log('Update Map', updateMap); 


    for(let [key, ls] of updateMap.entries()){

      console.log(ls); 

      if(ls.length > 1){

        let count = 0 
        let subvariants = []
        let bids = []
        let selected = false
        let userAdded = false

        for (let variant of ls){
          bids.push(variant.bid)
          count += variant.count
          subvariants.push(...variant.sub_variants)
          selected = selected || variant.isSelected;
          userAdded = userAdded|| variant.isAddedFittingVariant;  
        }


        const variant : Variant = new Variant(count, ls[0].variant, selected, userAdded, 0, false, false, false, true, subvariants, InfixType.NOT_AN_INFIX)
        variant.bid = Math.min(...bids)
        variant.id = objectHash(ls[0].variant)

        variants.push(variant)

      } else {

        variants.push(ls[0])

      }
    }


    variants.forEach((v) => {
      v.percentage = Number.parseFloat(((v.count / total) * 100).toFixed(2));
    }); 

    this.variants = variants


    console.log(variants)

    // Propagate Backend Change
    // Update Variants / Start/End Activity Sets
    // Preserve Color Map
    // Update Activity Names in Tree / Log 


  }
}
