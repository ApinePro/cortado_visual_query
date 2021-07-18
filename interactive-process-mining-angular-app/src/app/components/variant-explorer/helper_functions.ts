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

export function getPolygonPoints(width: number, height: number): string {
  let x = 0, y = 0;
  let headLength = Math.tan(Constants.ARROW_HEAD_ANGLE / 360 * Math.PI * 2) * (height / 2);

  width -= headLength;

  let points = [];
  points.push(`${x},${y}`); // Top left
  points.push(`${x + width},${y}`); // Top right 
  points.push(`${x + width + headLength},${y + height / 2}`); // Arrow Head
  points.push(`${x + width},${y + height}`); // Bottom right
  points.push(`${x},${y + height}`); // Bottom left
  points.push(`${x + headLength},${y + height / 2}`); // Arrow feather
  return points.join(" ");
}