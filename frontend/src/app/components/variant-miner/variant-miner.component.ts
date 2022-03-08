import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import { BackendService } from './../../services/backendService/backend.service';
import { AfterViewInit, Component, ElementRef, Inject, OnInit, Renderer2 } from '@angular/core';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';
import { LayoutChangeDirective } from 'src/app/directives/layout-change.directive';
import { DropzoneConfig } from '../drop-zone/drop-zone.component';
import { deserialize, LeafNode, Variant, VariantElement } from '../variant-explorer/model';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer.directive';
import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-variant-miner',
  templateUrl: './variant-miner.component.html',
  styleUrls: ['./variant-miner.component.scss']
})
export class VariantMinerComponent extends LayoutChangeDirective implements OnInit, AfterViewInit{


  constructor(@Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
              private container: ComponentContainer,
              private backendService : BackendService,
              private sharedDataService: SharedDataService,
              private colorMapService: ColorMapService,
              elRef: ElementRef,
              renderer: Renderer2,
  ) {
    super(elRef.nativeElement, renderer);
  }

  FrequentMiningStrategy = FrequentMiningStrategy;
  VariantSortKey = VariantSortKey;
  currentSortKey : VariantSortKey;

  variantMinerOutOfFocus : boolean = false;

  ascending : boolean = false;

  variantMinerResults : any;
  colorMap;

  variantPatterns : Array<SubvariantPattern> = new Array<SubvariantPattern>()

  dropZoneConfig: any;
  variantMinerConfigInput: FormGroup;


  ngOnInit(): void {

    this.dropZoneConfig = new DropzoneConfig(
      '.xes',
      'false',
      'false',
      '<large> Import <strong>Event Log</strong> .xes file</large>'
    );

    this.variantMinerConfigInput = new FormGroup({
      k : new FormControl('', {
        updateOn: 'change',
      }),

      min_sup : new FormControl('', {
        updateOn: 'change',
      }),

      frequent_mining_strat : new FormControl(this.FrequentMiningStrategy.TraceTransaction, {
        updateOn: 'change',
      }),

    })
  }


  onSubmit(){

    console.log("SUBMIT", this.variantMinerConfigInput.value)

    const form_values = this.variantMinerConfigInput.value

    const config = new MiningConfig(form_values.k, form_values.min_sup, form_values.frequent_mining_strat)

    this.backendService.frequentSubtreeMining(config)


  }


  ngAfterViewInit(): void {

    this.colorMapService.colorMap$.subscribe((cMap) => {

      this.colorMap = cMap;
    })

    this.sharedDataService.frequentMiningResults$.subscribe((res) => {
      console.log(res)

      if (res){

        this.variantPatterns = new Array<SubvariantPattern>()

        res.forEach((p, i) => {

          if (p.valid){

            const variant : VariantElement = deserialize(p.obj);
            variant.setExpanded(true);


            this.variantPatterns.push(
              new SubvariantPattern(
                  i,
                  p.k,
                  variant,
                  p.sup,
                  p.child_parent_confidence,
                  p.subpattern_confidence,
                  p.cross_support_confidence,
                  p.maximal,
                  p.valid,
                  p.closed,
              )
            )
          }
        })
      }
    })
  }

  sort(key : VariantSortKey){

    if (this.currentSortKey == key){
      this.ascending = !this.ascending;
    } else {
      this.ascending = false;
    }

    this.variantPatterns.sort((a : SubvariantPattern, b : SubvariantPattern) => {
      if (a[key] < b[key]) {
        return this.ascending ? -1 : 1;
      } else if (a[key] > b[key]) {
        return this.ascending ? 1 : -1;
      } else {
        return 0;
      }
    })

    this.currentSortKey = key;
  }


  filter(){


  }




  computeActivityColor = (
    self: VariantDrawerDirective,
    element: VariantElement,
    variant: Variant
  ) => {
    let color;

    if (element instanceof LeafNode) {
      color = this.colorMap.get(element.asLeafNode().activity[0]);
    } else {
      color = '#d3d3d3';
    }


    return color;
  };

  handleResponsiveChange(left: number, top: number, width: number, height: number): void {

  }

  handleVisibilityChange(visibility: boolean): void {

  }

  handleZIndexChange(logicalZIndex: LogicalZIndex, defaultZIndex: string): void {

  }

  toggleBlur(event) {
    this.variantMinerOutOfFocus = event;
  }

}

export namespace VariantMinerComponent {
  export const componentName = 'VariantMinerComponent';
}

export class MiningConfig {
  k : number
  min_sup : number
  strat : number

  constructor(k, min_sup, strat){
    this.k = k;
    this.min_sup = min_sup;
    this.strat = strat;
  }


  serialize(){
    return {k : this.k, min_sup : this.min_sup, strat : this.strat}
  }
}

export enum FrequentMiningStrategy {
  TraceTransaction = 1,
  VariantTransaction = 2,
  TraceOccurence = 3,
  VariantOccurence = 4,
}


export enum VariantSortKey {
  k = 'k',
  index = 'index',
  support  = 'support',
  child_parent_confidence = 'child_parent_confidence',
  subpattern_confidence = 'subpattern_confidence',
  cross_support_confidence = 'cross_support_confidence',
  maximal = 'maximal',
  closed = 'closed',
}


export enum VariantFilterKey {
  k = 'k',
  support  = 'support',
  index = 'index',
  child_parent_confidence = 'child_parent_confidence',
  subpattern_confidence = 'subpattern_confidence',
  cross_support_confidence = 'cross_support_confidence',
  maximal = 'maximal',
  closed = 'closed',
}

export class SubvariantPattern{
  index : number;
  k : number;
  variant : VariantElement;
  support : number;
  child_parent_confidence : number;
  subpattern_confidence : number;
  cross_support_confidence : number;
  maximal : boolean;
  valid : boolean;
  closed : boolean;

  constructor(
    index : number,
    k : number,
    variant : VariantElement,
    support : number,
    child_parent_confidence : number,
    subpattern_confidence : number,
    cross_support_confidence : number,
    maximal : boolean,
    valid : boolean,
    closed : boolean
  ){
    this.index = index;
    this.k = k;
    this.variant = variant;
    this.support = support;
    this.child_parent_confidence = child_parent_confidence;
    this.subpattern_confidence = subpattern_confidence;
    this.cross_support_confidence = cross_support_confidence;
    this.maximal = maximal;
    this.valid = valid;
    this.closed = closed;
  }

}
