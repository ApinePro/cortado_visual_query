import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import { BackendService } from './../../services/backendService/backend.service';
import { AfterViewInit, Component, ElementRef, Inject, OnInit, Renderer2 } from '@angular/core';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';
import { LayoutChangeDirective } from 'src/app/directives/layout-change.directive';
import { DropzoneConfig } from '../drop-zone/drop-zone.component';

@Component({
  selector: 'app-variant-miner',
  templateUrl: './variant-miner.component.html',
  styleUrls: ['./variant-miner.component.css']
})
export class VariantMinerComponent extends LayoutChangeDirective implements OnInit, AfterViewInit{
  dropZoneConfig: any;


  constructor(@Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
              private container: ComponentContainer,
              private backendService : BackendService,
              private sharedDataService: SharedDataService,
              elRef: ElementRef,
              renderer: Renderer2,
  ) {
    super(elRef.nativeElement, renderer);
  }

  variantMinerOutOfFocus : boolean = false;

  ngAfterViewInit(): void {
    this.sharedDataService.frequentMiningResults$.subscribe((res) => {
      console.log("NEW RESULTS", res)
    })
  }

  ngOnInit(): void {

    this.dropZoneConfig = new DropzoneConfig(
      '.xml',
      'false',
      'false',
      '<large> Import <strong>Process Tree</strong> .ptml file</large>'
    );
  }


  startMining(){

    console.log("Mining")
    const config = new MiningConfig(12, 100, 3)


    this.backendService.frequentSubtreeMining(config)
  }


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
