import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';
import { ProcessTreeService } from 'src/app/services/processTreeService/process-tree.service';
import { LogService } from 'src/app/services/logService/log.service';
import * as objectHash from 'object-hash';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Variant, InfixType, injectWaitingTimeNodes } from 'src/app/components/variant-explorer/model';
import * as dummyBackendResponse from '../SharedDataService/dummy_backend_response.js';
import { skip } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VariantService {


  backendUrl = 'http://127.0.0.1:41211/';
  constructor(private logService : LogService,
              private httpClient: HttpClient,
              private processTreeService : ProcessTreeService,
              private colorMapService : ColorMapService,
             ) {

             }

  private _variants = new BehaviorSubject<Variant[]>(
    []
  );

  get variants$(): Observable<Variant[]> {
    return this._variants.asObservable().pipe(skip(1));
  }

  set variants(activities: Variant[]) {
    this._variants.next(activities);
  }

  get variants(): Variant[] {
    return this._variants.getValue();
  }


  public deleteVariants(bids : number[]): void {
    const delVariants = this.variants.filter((v) => bids.includes(v.bid))

    const nDelVar = bids.length
    const nDelTrace = delVariants.map((v) => v.count).reduce((a, b) => a + b);


    const fittingVariants = delVariants.filter((v) => v.deviation !== undefined && !v.deviation)
    let nDelFittingVar = 0
    let nDelFittingTraces = 0

    if(fittingVariants.length > 0){

      nDelFittingVar = fittingVariants.length
      nDelFittingTraces = fittingVariants.map((v) => v.count).reduce((a, b) => a + b);
    }

    this.variants = this.variants.filter((v) => !bids.includes(v.bid))

    this.propagateVariantDeletions(bids);


    const curStats = this.logService.logStatistics;
    this.logService.update_log_stats(curStats.numberFittingTraces - nDelFittingTraces, curStats.numberFittingVariants - nDelFittingVar, curStats.totalNumberTraces - nDelTrace , curStats.totalNumberVariants - nDelVar)



    // Count deleted Activites, Recompute if an Activity is a Start or End Activity.

  }


  public deleteActivity(activityName : string){

    const fallthrough = []
    const updateMap : Map<string, Variant[]> = new Map<string, Variant[]>();
    const changedStrings : Set<string> = new Set<string>();
    const delete_list = []

    for(let variant of this.variants){

      let tmp;

      if (variant.variant.getActivities().has(activityName)){
        const [variantElements, isFallthrough]  = variant.variant.deleteActivity(activityName);

        if (isFallthrough){
          fallthrough.push(variant.bid);
          continue;
        }

        if (variantElements){
          tmp = variantElements[0].asString();
          changedStrings.add(tmp)


          if (updateMap.has(tmp)){
            updateMap.get(tmp).push(variant)
          } else {
            updateMap.set(tmp, [variant])
          }

        } else {
          delete_list.push(variant.bid);
        }

      } else {
        tmp = variant.variant.asString();

        if (updateMap.has(tmp)){
          updateMap.get(tmp).push(variant)
        } else {
          updateMap.set(tmp, [variant])
        }

      }

    }

    console.log('Updating Color Map')



    const variants = this.apply_update_map(updateMap);

    let delete_member_list = []
    let merge_list = []

    for (let change of changedStrings){

      if (updateMap.get(change).length == 1){
        delete_member_list.push(updateMap.get(change)[0].bid)
      } else {
        merge_list.push(updateMap.get(change).map(v =>{return v.bid}))
      }
    }

    const bids = delete_member_list.concat(merge_list.flat(1))

    this.logService.deleteActivityInEventLog(activityName);
    this.colorMapService.deleteActivityInColorMap(activityName);
    this.processTreeService.deleteActivityFromProcessTreeActivities(activityName);

    console.log('Activity Name', activityName, 'Fallthrough', fallthrough, 'Delete_Member_list', delete_member_list, 'Delete_List', delete_list)

    this.propagateActivityDeletion(activityName, fallthrough, delete_member_list, merge_list, delete_list).subscribe(
      (res) => {

        console.log('Got result', res, res['startActivities'], res['endActivities'])



        console.log('Deleted Activity')

        this.logService.startActivitiesInEventLog = new Set(res['startActivities'])
        this.logService.endActivitiesInEventLog = new Set(res['endActivities'])


        console.log(this.logService.startActivitiesInEventLog, this.logService.endActivitiesInEventLog)
        this.logService.update_log_stats(null, null, null, updateMap.size);
        this.variants = variants
      }
    )

    // Need to await new Performance Data from the Backend
    //injectWaitingTimeNodes(
    //  variants.filter((v) => {return bids.includes(v.bid)}).map((v) => v.variant));



  }


  private apply_update_map(updateMap: Map<string, Variant[]>) {
    const variants: Variant[] = [];

    for (let [key, ls] of updateMap.entries()) {

      if (ls.length > 1) {

        let count = 0;
        let subvariants = [];
        let bids = [];
        let selected = false;
        let userAdded = false;

        for (let variant of ls) {
          bids.push(variant.bid);
          count += variant.count;
          subvariants.push(...variant.sub_variants);
          selected = selected || variant.isSelected;
          userAdded = userAdded || variant.isAddedFittingVariant;
        }


        const variant: Variant = new Variant(count, ls[0].variant, selected, userAdded, 0, false, false, false, true, subvariants, InfixType.NOT_AN_INFIX);
        variant.bid = Math.min(...bids);
        variant.id = objectHash(ls[0].variant);

        variants.push(variant);

      } else {

        variants.push(ls[0]);

      }
    }

    return variants
  }


  private update_variant_percentages(){

    const total = this.variants.map((v) => v.count).reduce((a, b) => a + b);

    this.variants.forEach((v) => {
      v.percentage = Number.parseFloat(((v.count / total) * 100).toFixed(2));
    });

  }

  public renameActivity(activityName : string, newActivityName : string){
    const updateMap : Map<string, Variant[]> = new Map<string, Variant[]>();
    const changedStrings : Set<string> = new Set<string>();

    for(let variant of this.variants){

          let change : boolean = false;

          if (variant.variant.getActivities().has(activityName)){
            variant.variant.renameActivity(activityName, newActivityName);
            change = true
          }


          const tmp = variant.variant.asString();

          if (updateMap.has(tmp)){
            updateMap.get(tmp).push(variant)
          } else {
            updateMap.set(tmp, [variant])
          }


          if (change){
            changedStrings.add(tmp)
          }


    }

    this.logService.renameActivitiesInEventLog(activityName, newActivityName);
    this.processTreeService.renameActivityInProcessTree(activityName, newActivityName);
    this.colorMapService.renameColorInActivityColorMap(activityName, newActivityName);


    this.variants = this.apply_update_map(updateMap);

    let rename_list = []
    let merge_list = []

    for (let change of changedStrings){

      if (updateMap.get(change).length == 1){
        rename_list.push(updateMap.get(change)[0].bid)
      } else {
        merge_list.push(updateMap.get(change).map(v =>{return v.bid}))
      }
    }
    this.propagateActivityNameChange(merge_list, rename_list, activityName, newActivityName)


    this.logService.update_log_stats(null, null, null, updateMap.size);
  }


  propagateActivityNameChange(mergeList, renameList, activityName, newActivityName) {

    this.httpClient
      .post(this.backendUrl + 'modifylog/' + 'changeActivityName', {
        mergeList : mergeList,
        renameList : renameList,
        activityName: activityName,
        newActivityName: newActivityName,
      })
      .subscribe();
  }

  propagateActivityDeletion(activityName, fallthrough, delete_member_list, merge_list, delete_variant_list) {
    return this.httpClient
      .post(this.backendUrl + 'modifylog/' + 'deleteActivity', {
        activityName: activityName,
        fallthrough : fallthrough,
        delete_member_list : delete_member_list,
        merge_list : merge_list,
        delete_variant_list : delete_variant_list
      })
  }

  propagateVariantDeletions(bids : number[]) {
    this.httpClient
      .post(this.backendUrl + 'modifylog/' + 'deleteVariants', {
        bids: bids,
      })
      .subscribe();
  }

  revertChangeInBackend() {
    this.httpClient.post(
      this.backendUrl + 'modifylog/' + 'revertLastChange',
      {}
    );
  }

}
function startActivites(activityName: string, startActivites: any, endActivites: any): void {
  throw new Error('Function not implemented.');
}

function endActivites(activityName: string, startActivites: (activityName: string, startActivites: any, endActivites: any) => void, endActivites: any): void {
  throw new Error('Function not implemented.');
}

