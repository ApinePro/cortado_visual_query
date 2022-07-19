export function textColorForBackgroundColor(
  backgroundColorInHex: string,
  unselectedElementInTraceInfixSelectionMode: boolean = false
): string {
  if (
    backgroundColorInHex === undefined ||
    unselectedElementInTraceInfixSelectionMode
  ) {
    return 'white';
  }
  return isDarkColor(backgroundColorInHex) ? 'white' : 'black';

  function isDarkColor(color: string): boolean {
    let res;
    if (color === undefined) {
      return true;
    }
    if (color.includes('rgb')) {
      res = rgbToArray(color);
    } else {
      res = hexToRgb(color);
    }
    if (0.2126 * res['r'] + 0.7152 * res['g'] + 0.0722 * res['b'] >= 135) {
      return false;
    } else {
      return true;
    }
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  function rgbToArray(rgb) {
    let arr = rgb.slice(4, -1).split(',');
    return {
      r: arr[0],
      g: arr[1],
      b: arr[2],
    };
  }
}

import { Selection } from 'd3';
import { LeafNode } from '../objects/Variants/variant_element';

export function applyInverseStrokeToPoly(poly: Selection<any, any, any, any>) {
  const datum = poly.data()[0];
  if (datum) {
    if (datum instanceof LeafNode) {
      const rgb_code = poly.attr('style').match(/[\d.]+/g);
      const inversed = rgb_code.map((d) => 255 - parseInt(d));

      poly.attr('style', poly.attr('style').split(';')[0]);
      poly.attr('stroke-width', 2);
      poly.attr(
        'stroke',
        `rgb(${inversed[0]}, ${inversed[1]}, ${inversed[2]})`
      );
    } else {
      poly
        .attr('stroke', '#dc3545')
        .attr('style', poly.attr('style').split(';')[0])
        .attr('stroke-width', 2);
    }
  }
}