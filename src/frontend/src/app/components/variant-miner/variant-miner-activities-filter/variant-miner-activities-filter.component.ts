import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { ColorMapService } from '../../../services/colorMapService/color-map.service';
import { ActvitiyFilterState } from '../variant-miner.component';
import {
  LeafNode,
  VariantElement,
} from '../../../objects/Variants/variant_element';
import { VariantDrawerDirective } from '../../../directives/variant-drawer/variant-drawer.directive';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Variant } from '../../../objects/Variants/variant';
import * as d3 from 'd3';

@Component({
  selector: 'app-variant-miner-activities-filter',
  templateUrl: './variant-miner-activities-filter.component.html',
  styleUrls: ['./variant-miner-activities-filter.component.css'],
})
export class VariantMinerActivitiesFIlterComponent
  implements OnChanges, OnInit, OnDestroy
{
  constructor(private colorMapService: ColorMapService) {}

  @Input()
  activityNames: Array<string> = [];
  @Input()
  activityNamesFilter: Map<string, ActvitiyFilterState> = new Map<
    string,
    ActvitiyFilterState
  >();
  activityDummyVariants: Map<string, LeafNode> = new Map<string, LeafNode>();
  activityFilterStates: Map<string, { checkbox: boolean; toggle: boolean }>;

  @Output()
  activityButtonClick = new EventEmitter();

  @ViewChildren(VariantDrawerDirective)
  activityButtons: QueryList<VariantDrawerDirective>;

  colorMap: Map<string, string> = new Map<string, string>();

  private _destroy$ = new Subject();

  ngOnInit() {
    this.activityDummyVariants = new Map<string, LeafNode>();
    this.activityFilterStates = new Map<
      string,
      { checkbox: boolean; toggle: boolean }
    >();

    for (let activity of this.activityNames) {
      const leaf = new LeafNode([activity]);
      leaf.setExpanded(true);
      this.activityDummyVariants.set(activity, leaf);

      const activityFilter = this.activityNamesFilter.get(activity);
      switch (activityFilter) {
        case ActvitiyFilterState.Default:
          this.activityFilterStates.set(activity, {
            checkbox: false,
            toggle: false,
          });
          break;

        case ActvitiyFilterState.In:
          this.activityFilterStates.set(activity, {
            checkbox: true,
            toggle: false,
          });
          break;

        case ActvitiyFilterState.Out:
          this.activityFilterStates.set(activity, {
            checkbox: true,
            toggle: true,
          });
          break;
      }
    }

    this.colorMapService.colorMap$
      .pipe(takeUntil(this._destroy$))
      .subscribe((map) => {
        this.colorMap = map;
        if (this.activityButtons) {
          for (let button of this.activityButtons) {
            button.redraw();
          }
        }
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  computeActivityColor = (
    self: VariantDrawerDirective,
    element: VariantElement,
    variant: Variant
  ) => {
    let color;
    color = this.colorMap.get(element.asLeafNode().activity[0]);

    if (!color) {
      color = '#d3d3d3'; // lightgrey
    }

    return color;
  };

  onMouseOverCbFc = (
    drawerDirective: VariantDrawerDirective,
    element: VariantElement,
    variant: VariantElement,
    selection
  ) => {
    selection
      .on('mouseover', function (event, d) {
        const rgb_code = d3
          .select(this)
          .select('polygon')
          .attr('style')
          .match(/[\d.]+/g);
        const lightend = rgb_code.map((d) =>
          parseInt(d) + 50 > 255 ? 255 : parseInt(d) + 50
        );

        d3.select(this)
          .select('polygon')
          .style('fill', `rgb(${lightend[0]},${lightend[1]},${lightend[2]})`)
          .style('stroke-width', 2);
      })
      .on('mouseout', function (event, d) {
        const rgb_code = d3
          .select(this)
          .select('polygon')
          .attr('style')
          .match(/[\d.]+/g);
        const darkend = rgb_code.map((d) =>
          parseInt(d) - 50 < 0 ? 0 : parseInt(d) - 50
        );

        d3.select(this)
          .select('polygon')
          .style('fill', `rgb(${darkend[0]},${darkend[1]},${darkend[2]})`);
      });
  };

  ngOnChanges(changes: SimpleChanges): void {
    // A somewhat crude way to trigger a redraw after the value did change and preventing it from firing on the initalization
    // Review when the colormap might change after init
    this.activityDummyVariants = new Map<string, LeafNode>();

    for (let activity of changes.activityNames.currentValue) {
      const leaf = new LeafNode([activity]);
      leaf.setExpanded(true);
      this.activityDummyVariants.set(activity, leaf);
    }
  }

  public get actvitiyFilterState(): typeof ActvitiyFilterState {
    return ActvitiyFilterState;
  }

  // tslint:disable-next-line:typedef
  activityFilterChange(event, activity) {
    const checkbox = this.activityFilterStates.get(activity).checkbox;
    const toggle = this.activityFilterStates.get(activity).toggle;
    let filter = ActvitiyFilterState.Default;

    if (checkbox === false) {
      filter = ActvitiyFilterState.Default;
      this.activityFilterStates.set(activity, {
        checkbox: false,
        toggle: false,
      });
      event.preventDefault();
    } else if (checkbox === true && toggle === false) {
      filter = ActvitiyFilterState.In;
    } else if (checkbox === true && toggle === true) {
      filter = ActvitiyFilterState.Out;
    }

    this.activityNamesFilter.set(activity, filter);
    this.activityButtonClick.emit({ activityName: activity, filter });
  }
}
