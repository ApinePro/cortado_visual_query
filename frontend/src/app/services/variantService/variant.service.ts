import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';
import { ProcessTreeService } from 'src/app/services/processTreeService/process-tree.service';
import { LogService } from 'src/app/services/logService/log.service';
import * as objectHash from 'object-hash';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { skip } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { mapVariants } from 'src/app/utils/util';
import {
  getSelectedChildren,
  handleTreeLevelsWithOneChild,
  InfixType,
  setParent,
  someChildrenSelected,
} from 'src/app/objects/Variants/infix_selection';
import { Subvariant } from 'src/app/objects/Variants/subvariant';
import { Variant } from 'src/app/objects/Variants/variant';
import {
  deserialize,
  injectWaitingTimeNodes,
  SequenceGroup,
} from 'src/app/objects/Variants/variant_element';

@Injectable({
  providedIn: 'root',
})
export class VariantService {
  backendUrl = 'http://127.0.0.1:41211/';
  variantService: any;
  constructor(
    private logService: LogService,
    private httpClient: HttpClient,
    private processTreeService: ProcessTreeService,
    private colorMapService: ColorMapService
  ) {}

  private _variants = new BehaviorSubject<Variant[]>([]);

  get variants$(): Observable<Variant[]> {
    return this._variants.asObservable().pipe(skip(1));
  }

  set variants(activities: Variant[]) {
    this._variants.next(activities);
  }

  get variants(): Variant[] {
    return this._variants.getValue();
  }

  private _cachedChange = new BehaviorSubject<boolean>(false);

  get cachedChange$(): Observable<boolean> {
    return this._cachedChange.asObservable();
  }

  set cachedChange(change: boolean) {
    this._cachedChange.next(change);
  }

  get cachedChange(): boolean {
    return this._cachedChange.getValue();
  }

  public nUserVariants: number = 0;

  addSelectedTraceInfix(variant: Variant): void {
    let thereAreSelectedChildren = someChildrenSelected(variant.variant, true);

    if (thereAreSelectedChildren && !variant.variant.selected) {
      let infixType;
      let children = variant.variant.getElements();
      if (children[0].selected) {
        infixType = InfixType.PREFIX;
      } else if (children[children.length - 1].selected) {
        infixType = InfixType.POSTFIX;
      } else {
        infixType = InfixType.PROPER_INFIX;
      }
      let newInfix = getSelectedChildren(variant.variant);
      let reducedInfix = handleTreeLevelsWithOneChild(newInfix);
      if (!(reducedInfix instanceof SequenceGroup)) {
        // Every variant should be a sequence group
        reducedInfix = new SequenceGroup([reducedInfix]);
      }
      const newVariant = new Variant(
        1,
        reducedInfix,
        false,
        true,
        false,
        0,
        false,
        true,
        false,
        true,
        [],
        infixType
      );

      let currentVariants = this.variants;

      newVariant.alignment = undefined;
      newVariant.deviation = undefined;
      newVariant.id = objectHash(newVariant);

      this.nUserVariants += 1;
      newVariant.bid = -this.nUserVariants;

      const duplicate = currentVariants.map((v) => v.id === newVariant.id);

      if (!duplicate.includes(true)) {
        currentVariants.push(newVariant);
        this.variants = currentVariants;
      } else {
        // Will think about some warning mechanism later
      }
    }
  }

  public deleteVariants(bids: number[]): void {
    const delVariants = this.variants.filter((v) => bids.includes(v.bid));

    if (delVariants.every((v) => v.userDefined)) {
      this.variants = this.variants.filter((v) => !bids.includes(v.bid));
    } else {
      const fittingVariants = delVariants.filter(
        (v) => v.deviation !== undefined && !v.deviation
      );

      this.propagateVariantDeletions(bids).subscribe((res) => {
        this.logService.activitiesInEventLog = res['activities'];
        this.logService.startActivitiesInEventLog = new Set(
          res['startActivities']
        );
        this.logService.endActivitiesInEventLog = new Set(res['endActivities']);
        this.logService.computeLogStats(this.variants);
        this.variants = this.variants.filter((v) => !bids.includes(v.bid));
        this.cachedChange = true;
      });
    }

    // Count deleted Activites, Recompute if an Activity is a Start or End Activity.
  }

  public deleteActivity(activityName: string) {
    const fallthrough = [];
    const updateMap: Map<string, Variant[]> = new Map<string, Variant[]>();
    const changedStrings: Set<string> = new Set<string>();
    const delete_list = [];

    for (let variant of this.variants.filter((v) => !v.userDefined)) {
      let tmp;

      if (variant.variant.getActivities().has(activityName)) {
        const [variantElements, isFallthrough] =
          variant.variant.deleteActivity(activityName);

        if (isFallthrough) {
          fallthrough.push(variant.bid);
          continue;
        }

        if (variantElements) {
          tmp = variantElements[0].asString();
          changedStrings.add(tmp);
          this.delete_actvities_subvariants(variant, activityName);

          if (updateMap.has(tmp)) {
            updateMap.get(tmp).push(variant);
          } else {
            updateMap.set(tmp, [variant]);
          }
        } else {
          delete_list.push(variant);
        }
      } else {
        tmp = variant.variant.asString();

        if (updateMap.has(tmp)) {
          updateMap.get(tmp).push(variant);
        } else {
          updateMap.set(tmp, [variant]);
        }
      }
    }

    const variants = this.apply_update_map(updateMap);

    let delete_member_list = [];
    let merge_list = [];

    for (let change of changedStrings) {
      if (updateMap.get(change).length == 1) {
        delete_member_list.push(updateMap.get(change)[0].bid);
      } else {
        merge_list.push(
          updateMap.get(change).map((v) => {
            return v.bid;
          })
        );
      }
    }

    const bids = delete_member_list.concat(merge_list.flat(1));

    this.logService.deleteActivityInEventLog(activityName);
    this.colorMapService.deleteActivityInColorMap(activityName);

    this.propagateActivityDeletion(
      activityName,
      fallthrough,
      delete_member_list,
      merge_list,
      delete_list.map((v) => v.bid)
    ).subscribe((res) => {
      this.logService.startActivitiesInEventLog = new Set(
        res['startActivities']
      );

      this.logService.endActivitiesInEventLog = new Set(res['endActivities']);

      variants.forEach((v) => {
        for (let bid of Object.keys(res['update_variants'])) {
          if (v.bid.toString() === bid) {
            v.sub_variants = res['update_variants'][v.bid]['sub_variants'];
            v.count = res['update_variants'][v.bid]['count'];
          }
        }
      });

      res['new_variants'].forEach((variant) => {
        variant['id'] = objectHash(variant['variant']);
        variant['variant'] = deserialize(variant.variant);
      });

      const new_variants = this.addVariantInformation(res['new_variants']);

      variants.push(...new_variants);

      const userDefinedVariants = this.variants.filter((v) => v.userDefined);
      userDefinedVariants.forEach((v) =>
        v.variant.deleteActivity(activityName)
      );

      variants.push(...userDefinedVariants);

      this.cachedChange = true;

      this.logService.computeLogStats(variants);

      this.variants = variants;
    });
  }

  private apply_update_map(updateMap: Map<string, Variant[]>) {
    const variants: Variant[] = [];

    for (let [key, ls] of updateMap.entries()) {
      if (ls.length > 1) {
        let count = 0;
        let subvariants: Subvariant[] = [];
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

        const subvariant_map: Map<string, Subvariant[]> = new Map<
          string,
          Subvariant[]
        >();

        for (let subvariant of subvariants) {
          console.log('Subvariant', subvariant.variant);
          const str = subvariant.variant
            .map((v) => v[0].activity + '_' + v[0].lifecycle)
            .reduce((a, b) => a + '$' + b);

          if (!subvariant_map.has(str)) {
            subvariant_map.set(str, [subvariant]);
          } else {
            subvariant_map.get(str).push(subvariant);
          }
        }

        const new_subvariants = [];
        console.log('Subvar Map', subvariant_map);

        for (let subvariant_entries of subvariant_map.values()) {
          console.log('Subvariant Entries', subvariant_entries);
          const variant = subvariant_entries[0];
          variant.count = subvariant_entries
            .map((v) => v.count)
            .reduce((a, b) => a + b);

          new_subvariants.push(variant);
        }

        console.log('Variant', ls[0]);
        console.log('Subvariants ', new_subvariants);

        const variant: Variant = new Variant(
          count,
          ls[0].variant,
          selected,
          true,
          userAdded,
          0,
          false,
          false,
          false,
          true,
          new_subvariants,
          InfixType.NOT_AN_INFIX
        );
        variant.bid = Math.min(...bids);
        variant.id = objectHash(ls[0].variant);

        variants.push(variant);
      } else {
        variants.push(ls[0]);
      }
    }

    return variants;
  }

  public renameActivity(activityName: string, newActivityName: string) {
    const updateMap: Map<string, Variant[]> = new Map<string, Variant[]>();
    const changedStrings: Set<string> = new Set<string>();

    for (let variant of this.variants.filter((v) => !v.userDefined)) {
      let change: boolean = false;

      if (variant.variant.getActivities().has(activityName)) {
        variant.variant.renameActivity(activityName, newActivityName);

        this.rename_activities_subvariants(
          variant,
          activityName,
          newActivityName
        );

        console.log('Variant after Rename', variant);

        change = true;
      }

      const tmp = variant.variant.asString();

      if (updateMap.has(tmp)) {
        updateMap.get(tmp).push(variant);
      } else {
        updateMap.set(tmp, [variant]);
      }

      if (change) {
        changedStrings.add(tmp);
      }
    }

    this.logService.renameActivitiesInEventLog(activityName, newActivityName);
    this.processTreeService.renameActivityInProcessTree(
      activityName,
      newActivityName
    );
    this.colorMapService.renameColorInActivityColorMap(
      activityName,
      newActivityName
    );

    const user_defined_variants = this.variants.filter((v) => v.userDefined);
    user_defined_variants.forEach((v) =>
      v.variant.renameActivity(activityName, newActivityName)
    );

    const variants = this.apply_update_map(updateMap);

    console.log(variants);

    variants.push(...user_defined_variants);
    this.variants = variants;

    let rename_list = [];
    let merge_list = [];

    for (let change of changedStrings) {
      if (updateMap.get(change).length == 1) {
        rename_list.push(updateMap.get(change)[0].bid);
      } else {
        merge_list.push(
          updateMap.get(change).map((v) => {
            return v.bid;
          })
        );
      }
    }

    this.propagateActivityNameChange(
      merge_list,
      rename_list,
      activityName,
      newActivityName
    );

    this.logService.update_log_stats(null, null, null, updateMap.size);
    this.cachedChange = true;
  }

  propagateActivityNameChange(
    mergeList,
    renameList,
    activityName,
    newActivityName
  ) {
    this.httpClient
      .post(this.backendUrl + 'modifylog/' + 'changeActivityName', {
        mergeList: mergeList,
        renameList: renameList,
        activityName: activityName,
        newActivityName: newActivityName,
      })
      .subscribe((res) => console.log('Variant after Finsih', this.variants));
  }

  propagateActivityDeletion(
    activityName,
    fallthrough,
    delete_member_list,
    merge_list,
    delete_variant_list
  ) {
    return this.httpClient.post(
      this.backendUrl + 'modifylog/' + 'deleteActivity',
      {
        activityName: activityName,
        fallthrough: fallthrough,
        delete_member_list: delete_member_list,
        merge_list: merge_list,
        delete_variant_list: delete_variant_list,
      }
    );
  }

  propagateVariantDeletions(bids: number[]) {
    return this.httpClient.post(
      this.backendUrl + 'modifylog/' + 'deleteVariants',
      {
        bids: bids,
      }
    );
  }

  revertChangeInBackend() {
    this.httpClient
      .post(this.backendUrl + 'modifylog/' + 'revertLastChange', {})
      .pipe(mapVariants())
      .subscribe((res) => {
        this.logService.activitiesInEventLog = res['activities'];
        this.logService.startActivitiesInEventLog = new Set(
          res['startActivities']
        );
        this.logService.endActivitiesInEventLog = new Set(res['endActivities']);

        this.logService.performanceInfoAvailable = true;
        this.logService.timeGranularity = res['timeGranularity'];
        this.logService.logGranularity = res['timeGranularity'];

        this.colorMapService.createColorMap(
          Object.keys(this.logService.activitiesInEventLog)
        );

        this.cachedChange = false;

        const variants = this.addVariantInformation(res['variants']);
        this.variants = variants;
        this.logService.computeLogStats(variants);
      });
  }

  public addVariantInformation(variants: Variant[]): Variant[] {
    injectWaitingTimeNodes(variants.map((v) => v.variant));

    variants.forEach((v, i) => {
      v.isConformanceOutdated = true;
      v.userDefined = false;
      v.isTimeouted = false;
      v.isSelected = false;
      v.isDisplayed = true;
      v.isAddedFittingVariant = false;
      v.infixType = InfixType.NOT_AN_INFIX;
      setParent(v.variant);
    });

    return variants;
  }

  private rename_activities_subvariants(
    variant: Variant,
    activtiyName,
    newActivityName
  ) {
    variant.sub_variants.forEach((sv) => {
      rename_subvariants(sv, activtiyName, newActivityName);
    });

    function rename_subvariants(
      variant: Subvariant,
      activtiyName,
      newActivityName
    ) {
      variant.variant.forEach((r) => {
        if (r[0].activty === activtiyName) {
          r[0].activty = newActivityName;
        }
      });
    }
  }

  private delete_actvities_subvariants(variant: Variant, activityName) {
    variant.sub_variants.forEach((sv) => {
      filter_subvariants(sv, activityName);
    });

    function filter_subvariants(variant: Subvariant, activityName) {
      variant.variant = variant.variant.filter((r) => {
        return r[0].activity !== activityName;
      });
    }
  }
}
