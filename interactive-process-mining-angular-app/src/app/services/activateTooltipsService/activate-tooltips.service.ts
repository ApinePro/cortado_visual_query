import {Injectable} from '@angular/core';
//jQuery
declare var $;

@Injectable({
  providedIn: 'root'
})
export class ActivateTooltipsService {

  constructor() {
  }

  public activate() {
    //activate tooltips
    // @ts-ignore
    $('[data-toggle="tooltip"]').tooltip({
      container: "body",
      placement: "top",
      boundary: 'window',
      delay: {show: 200, hide: 60}
    });
  }
}
