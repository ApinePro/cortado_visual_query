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
    $('[data-toggle="tooltip"]').tooltip({
      container: 'body',
      placement: 'top',
      boundary: 'window',
      delay: {show: 200, hide: 60}
    });
  }

  public close(): void {
    $('[data-toggle="tooltip"]').tooltip('hide');
  }

  public disable(): void {
    // activate tooltips
    // @ts-ignore
    $('[data-toggle="tooltip"]').tooltip('disable');
  }

  public enable(): void {
    // activate tooltips
    // @ts-ignore
    $('[data-toggle="tooltip"]').tooltip('enable');
  }
}
