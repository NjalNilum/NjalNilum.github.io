/** 2 PI */
const PI2 = Math.PI * 2;

/** PI/2 */
const HALF_PI = Math.PI / 2;

/** In Pixeldimensionen ist das ein sehr kleines Epsilon und ausreichend klein. */
const EPS = 0.01;

/**
 * Point class for computing positions, distances etc.
 */
class Point {
    /**
     * Ctor.
     * @param {number} x x coordinate
     * @param {number} y y coordinate
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Deep copies the actual point and returns a new point. 
     * @returns {Point} Real deep copy of actual point.
     */
    Copy() {
        return new Point(this.x, this.y);
    }

    /** Adds point to actual point and returns a new point like 'result = this + point'.
     * @param {Point} point Point to add
     * @returns {Point} this + point
     */
    AddTo(point) {
        return new Point(this.x + point.x, this.y + point.y);
    }

    /** Multiplies point to actual point and return a new pint like 'result = this * point'.
     * @param {Point} Point Point to multiply
     */
    MultiplyWith(point) {
        return new Point(this.x * point.x, this.y * point.y);
    }

    /**
     * Computes the difference in x and in y separately and returns a new poitn like result = this - point.
     * @param {Point} point 
     * @returns {Point} The new point that contains the differences in x and y.
     */
    GetDifferencesTo(point) {
        return new Point(Math.abs(this.x-point.x), Math.abs(this.y-point.y));
    }

    /**
     * Calculates the distance between the points this and point.
     * @param {Point} point Point to calculate the distance to.
     * @returns Returns the distance between point and this.
     */
    distanceTo(point) {
        var distance = Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
        return Math.abs(distance);
    }

    /**
     * Returns true if actual point and point are on same coordinates.
     * @param {Point} point Point to check.
     * @returns {boolean} True if points are same.
     */
    Equals(point) {
        if (this.distanceTo(point) < EPS) {
            return true;
        }
        return false;
    }

     /** Multiplies self with a scalar value.
     * @param {number} scalar Scalar to multiply
     */
     MultiplSelfyWithScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
    }

    /**
     * Move the current point to the new point. With the help of the adption factor you can determine how big the shift should be. 
     * The adaptation factor lies between 0 and 1 and is to be understood as a percentage value. 
     * @param {Point} newPoint Point to move the current point.
     * @param {Point} adaption Strength of movement. 1 means this = newPoint and 0 means no changes in this.
     */
    AdaptToNewPoint(newPoint, adaption) {
        this.x += (newPoint.x - this.x) * adaption;
        this.y += (newPoint.y - this.y) * adaption;
    }

    /**
     * Returns a point on the orbit. The current point (this) is the centre of the orbit.
     * @param {number} angle Mathematical angle in radians on the ellipse around the current point.
     * @param {number} radiusX Radius in X-direction in pixel
     * @param {number} radiusY Radius in Y-direction in pixel
     * @returns {Point} The Point on the orbit.
     */
    GetOrbitalPoint(angle, radiusX, radiusY) {
        // This ensures that the particles move either clockwise or anti-clockwise.
        let orbitalPoint = new Point();
        orbitalPoint.x = this.x + Math.cos(angle) * radiusX;
        orbitalPoint.y = this.y + Math.sin(angle) * radiusY;
        return orbitalPoint;
    }
}

/**
 * Helper class to define the rectangle and the nescessary corner points.
 * Considered values are corners, width and height.
 * 
 * This class does not care about device pixel ratio or similar things.
 */
class Rectangle {
    /**
     * The corners of the rectangle like [A, B, C, D]
     * @type {Array<Point>}
     */
    #corners;
    /** Window height dpr considered @type {number} */
    #height;
    /** Window width dpr considered @type {number} */
    #width;

    /**
     * Creates a rectangle with the given dimensions.
     * This has to be done in every resize of the window, when the rectangle is maximized.
     * DPR is not taken into account. The width and height values must already have been adjusted.
     * @param {number} width Width the rect should have.
     * @param {number} height Hidth the rect should have.
     */
    constructor(width, height) {
        this.UpdateRect(width, height);
    }

    /**
     * Update the dimensions of the rectangle.
     * This has to be done in every resize of the window, when the rectangle is maximized.
     * DPR is not taken into account. The width and height values must already have been adjusted.
     * @param {number} width Width the rect should have.
     * @param {number} height Hidth the rect should have.
     */
    UpdateRect(width, height) {
        this.#height = height;
        this.#width = width;
        this.#corners = new Array();
        this.#corners.push(new Point(0, 0));
        this.#corners.push(new Point(this.#width, 0));
        this.#corners.push(new Point(this.#width, this.#height));
        this.#corners.push(new Point(0, this.#height));
    }

    /**
     * The corners of the rectangle like [A, B, C, D]
     * @type {Array<Point>}
     */
    Corners() {
        return this.#corners;
    }
    /** Height of rectangle dpr considered @type {number} */
    Width() {
        return this.#width;
    }
    /** Width of rectangle dpr considered @type {number} */
    Height() {
        return this.#height;
    }

}

/**
 * Class for Calculating the proximity of a specific position relative to each corner of a rectangle (i.e. browser window).
 * I.e if mouse pointer is at top left exactly the resulting array looks like so [1,0,0,0].
 * Proximity values are normalized [0,1], where 0 means the maximum distance and 1 means the closest position to
 * a specified corner position. This will only work for rectangles btw.
 * The proximity of a specific position to the corner points is stored in this array in this order [A,B,C,D].
 */
class Proximity {
    /** Array that contains the normalised proximity of a certain position to a corner point of a rectangle.
     * @type {Array<number>}
     */
    #proximities;

    /** Ctor initiates the array for a position that is equidistant to all points. I.e. all values of the array correspond to 0.5. */
    constructor() {
        this.#proximities = new Array(); // its magic. Every rect has got 4 corners
        for (let i = 0; i <= 3; i++) {
            this.#proximities[i] = 0.5
        };
    }

    /**
     * This method calculates the normalised approximation to the corner points of the reference system for the passed point in the reference system. 
     * @param {Rectangle} rectangle     Data of the reference system in which pointOfInterest is located.
     * @param {Point} pointOfInterest   The proximities to the corner points of the rectangle are calculated for this point.
     */
    Update(rectangle, pointOfInterest) {
        for (let i = 0; i < this.#proximities.length; i++) {
            this.#proximities[i] = getCornerPointValue(rectangle.Width(), rectangle.Height(), rectangle.Corners()[i], pointOfInterest)
        }
    }
    
    /** Array that contains the normalised proximity of a certain position to a corner point of a rectangle.
     * @type {Array<number>}
     */
    GetProximities() {
        return this.#proximities;
    }
}


/**
 * Returns a random floating point number for which applies [min, max]
 * 
 * @param {number} min    Smallest value that can be returned
 * @param {number} max    Biggest value that can be returned
 * @returns {number}      Random floating point number for which applies [min, max]
 */
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns randomly either 1 or -1.
 * 
 * @returns {number}  1 or -1
 */
function changeSignRandom() {
    if (Math.random() < 0.5) return -1;
    return 1;
}

/**
 * Rotates "pointToRotate" by "angle" radians around the centre "centre". 
 * @param {Point} center Center point of the rotation.
 * @param {Point} pointToRotate Point that will be rotated.
 * @param {number} angle Angle by which is rotated.
 * @returns {Point} The new point that results from the rotation.
 */
function Rotate(center, pointToRotate, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        newX = (cos * (pointToRotate.x - center.x)) + (sin * (pointToRotate.y - center.y)) + center.x,
        newY = (cos * (pointToRotate.y - center.y)) - (sin * (pointToRotate.x - center.x)) + center.y;
    return new Point(newX, newY);
}

/**
 * Assume that in each corner point of a rectangle there is a weight of 1.0 of the respective corner point, whereas the remaining 
 * three corner points then have a weight of 0.0. The further away a pointOfInterest is from a corner point, the less influence the 
 * corner point has on the pointOfInterest. And the closer a pointOfInterest is to a corner point, 
 * the more influence the corner point has on the pointOfInterest.
 * 
 * This function calculates the influence of a given corner point on a pointOfInterest.
 * 
 * @param {number} width            Of the rectangle
 * @param {number} height           Of the rectangle
 * @param {Point} cornerPoint       Given corner point of the Rectangle, which is A, B, C or D.
 * @param {Point} pointOfInterest   Any point inside the rectangle.
 * @returns                         The proximity of the corner point on the pointOfInterest.
 */
function getCornerPointValue(width, height, cornerPoint, pointOfInterest) {
    if (cornerPoint.Equals(pointOfInterest)) {
        return 1;
    }
    
    cornerpointMaxLine = getCornerpointMaxLine(width, height, cornerPoint, pointOfInterest)
    let normalizedGravity = getNormalizedGravity(cornerPoint, pointOfInterest, cornerpointMaxLine);
    return normalizedGravity;
}

/**
 * Actually, I wanted to solve all this with angle functions, but all the ready-made functions I found on the net were not correct 
 * in the limiting cases. It seemed easier to transform the corners of the rectangle into a single coordinate system 
 * instead of implementing the angle functions themselves. Better people have already failed at this.
 * 
 * This function transforms all corner points into the same coordinate system. The signs of the different quadrants would otherwise be a problem. 
 * This then means that the corner point is always the origin of the new coordinate system. This further means that c=0 if y = mx+ c. 
 * And that is exactly the shit, c=0.
 * Then a straight line is formed from the origin (corner point) and the pointOfInterest. The intersection of this straight line 
 * with the edge of the rectangle bounds a distance inside the rectangle. This means that the point at the end of this line is on 
 * the edge of the rectangle and is therefore no longer influenced by the corner point, weight=0 (or gravity=0).
 * If you now know the distance between the corner point and the pointOfInterest, 
 * you also know the weight of the corner point on the pointOfInterest.
 * 
 * @param {number} width            Of the rectangle
 * @param {number} height           Of the rectangle
 * @param {Point} cornerPoint      Given corner point of the Rectangle, which is A, B, C or D.
 * @param {Point} pointOfInterest  Any point inside the rectangle.
 * @returns                         Length of the distance resulting from the corner point, pointOfInterest and edge of the rectangle.
 */
function getCornerpointMaxLine(width, height, cornerPoint, pointOfInterest) {
    transformatedPOI = new Point(Math.abs(cornerPoint.x - pointOfInterest.x), Math.abs(cornerPoint.y - pointOfInterest.y))
    transforamtedCornerPoint = new Point(0, 0);
    m = (transformatedPOI.y - transforamtedCornerPoint.y) / (transformatedPOI.x - transforamtedCornerPoint.x);
    yValueOfLine = m * width;
    if (yValueOfLine > height) {
        xValueOfLine = height / m;
        return transforamtedCornerPoint.distanceTo(new Point(xValueOfLine, height));
    }
    return transforamtedCornerPoint.distanceTo(new Point(width, yValueOfLine));
}

/**
 * Calculates the normalised weight (gravity) of a corner point on a pointOfInterest.
 * 
 * @param {Point} cornerPoint      Given corner point of the Rectangle, which is A, B, C or D.
 * @param {Point} pointOfInterest  Any point inside the rectangle.
 * @param {number} maxLength        Length of the distance resulting from the corner point, pointOfInterest and edge of the rectangle.
 * @returns                         Gravity of POI between 0 and 1. 0 means maximum distance to cornerPoint. 1 means POI = cornerPoint.
 */
function getNormalizedGravity(cornerPoint, pointOfInterest, maxLength) {
    distanceToPoint = ((1.0) * cornerPoint.distanceTo(pointOfInterest)) / maxLength;
    distanceToPoint = Math.min(1, distanceToPoint);
    return 1 - distanceToPoint;
}

/**
 * This function calculates the function value (y) on a growth curve from an incoming original value (x).
 * Why? The color gradients of the particles moving between points A (top left) and B (top right) 
 * correspond to a LinearGradientBrush with 2 ColorStops at 0 and 1. This means that you only see rich colors in 
 * the corners that correspond to the defined corner colors. 
 * Basically, this function pushes both ColorStops in the direction of 0.5. 
 * 
 * @param {number} originalValue          Original value. X-value for calculating the value of the growth curve.
 * @param {number} usageOfThisInPercent   Proportion of the new value in competition with the original value.
 * @returns {number}                      The y-value on the growth function 
 */
function makeLogisticGrowthFunction(originalValue, usageOfThisInPercent) {
    let newValue = 1.0 / (1 + Math.pow(Math.E, (-4 * originalValue + 2) * 4));
    return newValue * usageOfThisInPercent + originalValue * (1 - usageOfThisInPercent);
}