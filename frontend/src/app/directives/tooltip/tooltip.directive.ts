import { Directive, ElementRef, AfterViewInit } from '@angular/core';
import { ActivateTooltipsService } from '../../services/activateTooltipsService/activate-tooltips.service';

@Directive({
  selector: '[data-bs-toggle="tooltip"]' // eslint-disable-line @angular-eslint/directive-selector
})
export class TooltipDirective implements AfterViewInit {

  constructor(private el: ElementRef, private activateTooltipsService: ActivateTooltipsService) {}

  ngAfterViewInit() {
    this.activateTooltipsService.initializeTooltip(this.el.nativeElement);
  }
}
