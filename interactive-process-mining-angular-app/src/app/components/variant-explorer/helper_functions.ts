import { Constants } from "./model";

export function isDarkColor(colorInHex: string): boolean {
  const res = hexToRgb(colorInHex);
  if (0.2126 * res['r'] + 0.7152 * res['g'] + 0.0722 * res['b'] >= 135) {
    return false;
  } else {
    return true;
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}
