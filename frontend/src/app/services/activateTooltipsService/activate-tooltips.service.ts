import {Injectable} from '@angular/core';
// jQuery
declare var $;

@Injectable({
  providedIn: 'root'
})
export class ActivateTooltipsService {

  constructor() {
  }

  public initialize(): void {
    // activate tooltips
    // @ts-ignore
    $('[data-bs-toggle="tooltip"]').tooltip({
      container: 'body',
      placement: 'top',
      boundary: 'window',
      html: true,
      trigger: 'hover',
      delay: {show: 200, hide: 50},
      sanitize: false
    });

    $('[data-bs-toggle="tooltip"]').on('click', function () {
      $(this).tooltip('hide')
    })

    $('[data-bs-toggle="popover"]').popover({
      container: 'body',
      placement: 'top',
      boundary: 'window',
      html: true,
      // delay: {show: 200, hide: 100000},
      sanitize: false
    });
  }

  public close(): void {
    $('[data-bs-toggle="popover"]').popover('hide');
    $('[data-bs-toggle="tooltip"]').tooltip('hide');
  }

  public disable(): void {
    // activate tooltips
    // @ts-ignore
    $('[data-bs-toggle="popover"]').popover('disable');
    $('[data-bs-toggle="tooltip"]').tooltip('disable');
  }

  public enable(): void {
    // activate tooltips
    // @ts-ignore
    $('[data-bs-toggle="popover"]').popover('enable');
    $('[data-bs-toggle="tooltip"]').tooltip('enable');
  }
}
