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
  someChildrenSelected,
} from 'src/app/objects/Variants/infix_selection';
import { Variant } from 'src/app/objects/Variants/variant';
import {
  deserialize,
  SequenceGroup,
} from 'src/app/objects/Variants/variant_element';
import {
  addVariantInformation,
  compute_delete_activity_variants,
  compute_rename_activity_variants,
} from './variant-transformation';
import { ROUTES } from 'src/app/constants/backend_route_constants';

@Injectable({
  providedIn: 'root',
})
export class VariantService {
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

  public addSelectedTraceInfix(variant: Variant): void {
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
        0,
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
    const [variants, fallthrough, delete_member_list, merge_list, delete_list] =
      compute_delete_activity_variants(activityName, this.variants);

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
            v.nSubVariants = res['update_variants'][v.bid]['nSubVariants'];
            v.count = res['update_variants'][v.bid]['count'];
          }
        }
      });

      res['new_variants'].forEach((variant) => {
        variant['id'] = objectHash(variant['variant']);
        variant['variant'] = deserialize(variant.variant);
      });

      const new_variants = addVariantInformation(res['new_variants']);

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

  public renameActivity(activityName: string, newActivityName: string) {
    const [variants, rename_list, merge_list, updateMap] =
      compute_rename_activity_variants(
        activityName,
        newActivityName,
        this.variants
      );

    this.logService.renameActivitiesInEventLog(activityName, newActivityName);
    this.processTreeService.renameActivityInProcessTree(
      activityName,
      newActivityName
    );
    this.colorMapService.renameColorInActivityColorMap(
      activityName,
      newActivityName
    );

    this.propagateActivityNameChange(
      merge_list,
      rename_list,
      activityName,
      newActivityName
    ).subscribe((res) => {
      variants.forEach((v) => {
        for (let bid of Object.keys(res)) {
          if (v.bid.toString() === bid) {
            v.nSubVariants = res[v.bid]['nSubVariants'];
          }
        }
      });

      this.variants = variants;
    });

    this.logService.update_log_stats(null, null, null, updateMap.size);
    this.cachedChange = true;
  }

  private propagateActivityNameChange(
    mergeList,
    renameList,
    activityName,
    newActivityName
  ) {
    return this.httpClient.post(
      ROUTES.BASE_URL + ROUTES.MODIFY_LOG + 'changeActivityName',
      {
        mergeList: mergeList,
        renameList: renameList,
        activityName: activityName,
        newActivityName: newActivityName,
      }
    );
  }

  private propagateActivityDeletion(
    activityName,
    fallthrough,
    delete_member_list,
    merge_list,
    delete_variant_list
  ) {
    return this.httpClient.post(
      ROUTES.BASE_URL + ROUTES.MODIFY_LOG + 'deleteActivity',
      {
        activityName: activityName,
        fallthrough: fallthrough,
        delete_member_list: delete_member_list,
        merge_list: merge_list,
        delete_variant_list: delete_variant_list,
      }
    );
  }

  private propagateVariantDeletions(bids: number[]) {
    return this.httpClient.post(
      ROUTES.BASE_URL + ROUTES.MODIFY_LOG + 'deleteVariants',
      {
        bids: bids,
      }
    );
  }

  revertChangeInBackend() {
    this.httpClient
      .post(ROUTES.BASE_URL + ROUTES.MODIFY_LOG + 'revertLastChange', {})
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

        const variants = addVariantInformation(res['variants']);
        this.variants = variants;
        this.logService.computeLogStats(variants);
      });
  }
}
