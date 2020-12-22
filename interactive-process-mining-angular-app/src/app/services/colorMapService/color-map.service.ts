import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {tap} from "rxjs/operators";
import * as constants from "./predefinedColors";

@Injectable({
  providedIn: 'root'
})
export class ColorMapService {

  constructor() {
  }

  getColorMap(activities: string[]): Map<string, string> {
    //TODO: ensure activities are ordered based on frequency
    const colorMap: Map<string, string> = new Map();
    activities.forEach((a, i) => {
      colorMap.set(a, this.get_color(i));
    });
    this._colorMap.next(colorMap);
    return colorMap;
  }

  // tslint:disable-next-line:variable-name
  private _colorMap = new Subject<Map<string, string>>();

  get colorMap$(): Observable<Map<string, string>> {
    return this._colorMap.asObservable();
  }


  private get_color(activityNameCount): string {
    let color = '';
    if (activityNameCount >= constants.colorRange.length) {
      color = this.generate_random_color();
      while (constants.colorRange.includes(color)) {
        color = this.generate_random_color();
      }
    } else {
      color = constants.colorRange[activityNameCount];
    }
    return color;
  }

  private generate_random_color(): string {
    const color = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
    return color;
  }
}
