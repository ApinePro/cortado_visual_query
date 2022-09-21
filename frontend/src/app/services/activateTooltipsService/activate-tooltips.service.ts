import { ElementRef, Injectable } from '@angular/core';
declare var bootstrap: any;
declare var $: any;

@Injectable({
  providedIn: 'root',
})
export class ActivateTooltipsService {
  public initializeChildren(elementRef: ElementRef): void {
    const tooltipElements = elementRef.nativeElement.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    tooltipElements.forEach((tooltipTriggerEl) => {
      this.initializeTooltip(tooltipTriggerEl);
    });

    const popoverElements = elementRef.nativeElement.querySelectorAll(
      '[data-bs-toggle="popover"]'
    );
    popoverElements.forEach((popoverTriggerEl) => {
      return new bootstrap.Popover(popoverTriggerEl, {
        container: 'body',
        placement: 'top',
        boundary: 'window',
        html: true,
        // delay: {show: 200, hide: 100000},
        sanitize: false,
      });
    });
  }

  public hideAll(): void {
    $('[data-bs-toggle="tooltip"]').tooltip('hide');
  }

  public initializeTooltip(element: any): void {
    const tooltip = new bootstrap.Tooltip(element, {
      container: 'body',
      placement: 'top',
      boundary: 'window',
      html: true,
      trigger: 'hover',
      delay: { show: 200, hide: 50 },
      sanitize: false,
    });

    element.addEventListener('click', (_) => {
      this.hideAll();
      setTimeout(() => {
        if (tooltip !== null) tooltip.hide();
      }, 500);
    });
  }

  public closeAllPopover() {
    $('[data-bs-toggle="popover"]').popover('hide');
  }

  public destroyTooltip(element: any): void {
    const tooltip = bootstrap.Tooltip.getInstance(element);
    if (tooltip !== null) tooltip.dispose();
  }
}
