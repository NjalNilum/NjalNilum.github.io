/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   {number}  r       The red color value
 * @param   {number}  g       The green color value
 * @param   {number}  b       The blue color value
 * @return  {number[]}        The HSV representation [h, s, v]
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
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  v       The value
 * @return  {number[]}        The RGB representation [r, b, g]
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

/**
 * Actually, I don't want to comment on this shit or change it again. This method calculates a resulting colour from the passed proximity[].
 * As a reminder, the proximity here indicates how close a particle is to a certain corner point. With this information and the colour values of the corner points, 
 * the colour of the particle is calculated according to its position.
 * In addition, this logistic growth function is called so that fewer areas in the rectangle consist of "mixed colours".
 * 
 * @param {Color[]} cornerColors                Array of colors within the 4 colors of the rectangle.
 * @param {number[]} proximityArray             Array within proximities to each corner of the rectangle
 * @param {number} useLogisticGrowthInPercent   Value [0, 1] for using a logistic growth function.
 * @returns {Color} color of the array.
 */
function getColor(cornerColors, proximityArray, useLogisticGrowthInPercent) {
  weightedColorArry = [];
  weightedColorArry.push(getWeightetColor(cornerColors[0], makeLogisticGrowthFunction(proximityArray[0], useLogisticGrowthInPercent)));
  weightedColorArry.push(getWeightetColor(cornerColors[1], makeLogisticGrowthFunction(proximityArray[1], useLogisticGrowthInPercent)));
  weightedColorArry.push(getWeightetColor(cornerColors[2], makeLogisticGrowthFunction(proximityArray[2], useLogisticGrowthInPercent)));
  weightedColorArry.push(getWeightetColor(cornerColors[3], makeLogisticGrowthFunction(proximityArray[3], useLogisticGrowthInPercent)));

  r = g = b = 0;
  for (let i = 0; i < weightedColorArry.length; i++) {
    var color = weightedColorArry[i];
    r += color.R;
    g += color.G;
    b += color.B;
  }
  newColor = new Color(
    Math.min(r, 255),
    Math.min(g, 255),
    Math.min(b, 255));

  // Don't tell anyone, I love full colours. 
  hsv = rgbToHsv(newColor.R, newColor.G, newColor.B);
  hsv[2] = Math.sqrt(hsv[2]); // = 1;  
  hsv[1] = Math.sqrt(hsv[1]); // = 1;  
  theEnlightedColor = hsvToRgb(hsv[0], hsv[1], hsv[2]);
  return new Color(theEnlightedColor[0], theEnlightedColor[1], theEnlightedColor[2]);
}

/**
 * 
 * @param {Color} color 
 * @param {*} weight 
 * @returns {Color} New weighted color.
 */
function getWeightetColor(color, weight) {
  var thecolor = color.Copy();
  thecolor.R *= weight;
  thecolor.G *= weight;
  thecolor.B *= weight;
  return thecolor;
}

/**
 * Color class.
 * This is not too complicated and is self-explanatory.
 * https://www.w3schools.com/colors/
 */
class Color {
  /**
   * Red value 0 to 255.
   * @type {number}
   */
  R;

  /**
   * Green value 0 to 255.
   * @type {number}
   */
  G;

  /**
   * Blue value 0 to 255.
   * @type {number}
   */
  B;

  /** 
   * Alpha value 0.0 to 1.0.
   * 0 means full transparency
   * 1 means full opacity
   * @type {number}
   */
  A;

  /**
   * Ctor
   * A is per default 1.
   * @param {number} r red
   * @param {number} g green
   * @param {number} b blue
   */
  constructor(r, g, b) {
    this.R = r;
    this.G = g;
    this.B = b;
    this.A = 1;
  }

  /**
   * Returns the color as string wihtout alpha.
   * @returns {string} Color like 'rgb(255,0,255)'
   */
  Get_Rgb_String() {
    return 'rgb(' + [this.R, this.G, this.B] + ')';
  }

  /**
     * Returns the color as string wiht a opacity to be defined in the arguments..
     * @param {number}    randomOpacity Random opacity [0.0,1.0]
     * @returns {string}  Color like 'rgba(255,0,255, 0.6)'
     */
  Get_Rgba_StringRandomOpacity(randomOpacity) {
    return 'rgba(' + [this.R, this.G, this.B, randomOpacity] + ')';
  }

  /**
   * Returns the color as string with alpha.
   * @returns {string} Color like 'rgba(255, 0, 255, 0.3)'
   */
  Get_Rgba_String() {
    return 'rgba(' + [this.R, this.G, this.B, this.A] + ')';
  }

  /**
   * Reset color to White and full opacity
   */
  SetWhite() {
    this.R = 255;
    this.G = 255;
    this.B = 255;
    this.A = 1;
  }

  /**
     * Copies the actual color. 
     * @returns {Color} Real deep copy of actual color.
     */
  Copy() {
    return new Color(this.R, this.G, this.B, this.A);
  }
}