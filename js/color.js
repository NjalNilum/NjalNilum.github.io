/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsv(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, v = max;

  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [h, s, v];
}

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v) {
  var r, g, b;

  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  return [r * 255, g * 255, b * 255];
}


function getColor(cornerColors, proximityArray, useLogisticGrowthInPercent) {
    weightedColorArry = [];
    weightedColorArry.push(getWeightetColor(cornerColors[0], makeLogisticGrowthFunction(proximityArray[0], useLogisticGrowthInPercent)));
    weightedColorArry.push(getWeightetColor(cornerColors[1], makeLogisticGrowthFunction(proximityArray[1], useLogisticGrowthInPercent)));
    weightedColorArry.push(getWeightetColor(cornerColors[2], makeLogisticGrowthFunction(proximityArray[2], useLogisticGrowthInPercent)));
    weightedColorArry.push(getWeightetColor(cornerColors[3], makeLogisticGrowthFunction(proximityArray[3], useLogisticGrowthInPercent)));

    r = g = b = 0;
    for (let i = 0; i < weightedColorArry.length; i++) {
      var color = weightedColorArry[i];
      r += Math.round(parseInt(color[0]));
      g += Math.round(parseInt(color[1]));
      b += Math.round(parseInt(color[2]));
    }
    newColor = [];
    newColor.push(
      Math.min(r, 255),
      Math.min(g, 255),
      Math.min(b, 255));

    // Don't tell anyone, I love full colours. 
    hsv = rgbToHsv(newColor[0], newColor[1], newColor[2]);
    hsv[2] = Math.sqrt(hsv[2]); // = 1;  
    hsv[1] = Math.sqrt(hsv[1]); // = 1;  
    theEnlightedColor = hsvToRgb(hsv[0], hsv[1], hsv[2]);
    return theEnlightedColor.join(', ')
}

function getWeightetColor(color, weight) {
  var thecolor = color.slice();
  thecolor[0] *= weight;
  thecolor[1] *= weight;
  thecolor[2] *= weight;
  return thecolor;
}