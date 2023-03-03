import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';
import { LayoutChangeDirective } from 'src/app/directives/layout-change/layout-change.directive';
import { ProcessTreeDrawerDirective } from 'src/app/directives/process-tree-drawer/process-tree-drawer.directive';
import { LocalProcessModelWithPatterns } from 'src/app/objects/LocalProcessModelWithPatterns';
import { InfixType } from 'src/app/objects/Variants/infix_selection';
import { LpmService } from 'src/app/services/lpmService/lpm.service';

@Component({
  selector: 'app-lpm-explorer',
  templateUrl: './lpm-explorer.component.html',
  styleUrls: ['./lpm-explorer.component.scss'],
})
export class LpmExplorerComponent
  extends LayoutChangeDirective
  implements OnInit
{
  lpms: LocalProcessModelWithPatterns[] = [];

  @ViewChild(ProcessTreeDrawerDirective)
  processTreeDrawer: ProcessTreeDrawerDirective;

  InfixType = InfixType;

  constructor(
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    elRef: ElementRef,
    renderer: Renderer2,
    public lpmService: LpmService
  ) {
    super(elRef.nativeElement, renderer);
  }

  ngOnInit(): void {
    this.lpmService.localProcessModels$.subscribe((models) => {
      this.lpms = models;
      this.processTreeDrawer.redraw(this.lpms[0].lpm);
      console.log(this.lpms);
    });
  }

  handleResponsiveChange(
    left: number,
    top: number,
    width: number,
    height: number
  ): void {}
  handleVisibilityChange(visibility: boolean): void {}
  handleZIndexChange(
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void {}

  exportLocalProcessModels() {
    console.log('implement lpm export here');
  }
}

export namespace LpmExplorerComponent {
  export const componentName = 'LpmExplorerComponent';
}
