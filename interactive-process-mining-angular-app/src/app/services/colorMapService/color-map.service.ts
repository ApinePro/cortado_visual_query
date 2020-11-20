import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {tap} from "rxjs/operators";
import * as constants from "./predefinedColors";

@Injectable({
  providedIn: 'root'
})
export class ColorMapService {

  constructor() {
  }

  /*
    private static readonly DEFAULT_COLOR_ATTRIBUTE = '@@classifier';

   getColorMap(attributeKey: string = ColorMapService.DEFAULT_COLOR_ATTRIBUTE): Observable<Map<string, string>> {
      const colorMap: Map<string, string> = new Map();

      return this.pm4pyService.getAttributeValues(attributeKey).pipe(tap(data => {
          let i = 0;
          let values = data["attribute_values"];
          while (i < values.length) {
            colorMap.set(values[i][0], this.get_color(i));
            i++;
          }
        }),
        map(() => colorMap)
      );
    }*/

  getColorMap(activities: string[]): Map<string, string> {
    //TODO: ensure activities are ordered based on frequency
    const colorMap: Map<string, string> = new Map();
    activities.forEach((a, i) => {
      colorMap.set(a, this.get_color(i));
    });
    return colorMap;
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
