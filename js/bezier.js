/** Class for moving bezuer curves and absolute coordinates for painting */
class Bezier {
    /** Start point
     * @type {Point}
     */
    #start;
    /** End point
     * @type {Point}
     */
    #end;

    /** Absolute control point 1
     * @type {Point}
     */
    #cp1;
    /** Absolute control point 2
     * @type {Point}
     */
    #cp2;

    /** cubic control point 1
     * @type {Point}
     */
    #cubicCp1;
    /** Cubic control point 2
     * @type {Point}
     */
    #cubicCp2;

    /** New control point 1 for movement
    * @type {Point}
    */
    #newCubicCp1;
    /** New control point 2 for movement
    * @type {Point}
    */
    #newCubicCp2;

    /**
     * I abuse the class point as a 2D vector so that I can use the X value for the adaptation of cp1 and the Y value 
     * for the adaptation of cp2. With love from clean code.
     */

    /** Original adaption.
     * Value that describes the amount of adaption of the actual control positions to the new control positions.
     * @type {Point}
     */
    #adaption;
    /** Variable adaption.
     * To change the speed of the adaption movement.
     * @type {Point}
     */
    #variableAdaption;

    /**
     * Ctor
     * @param {Point} start Start position of the bezier curve.
     * @param {Point} end End position of the bezier curve.
     * @param {Point} adaption Value that describes the amount of adaption of the actual control positions to the new control positions.
     */
    constructor(start, end, adaption) {
        this.#start = start;
        this.#end = end;

        this.#cubicCp1 = new Point(0.5, 0.5);
        this.#cubicCp2 = new Point(0.5, 0.5);
        this.#newCubicCp1 = this.#cubicCp1.Copy();
        this.#newCubicCp2 = this.#cubicCp2.Copy();

        this.#updateAbsoluteControlPoints();

        this.#adaption = adaption.Copy();
        this.#variableAdaption = adaption.Copy();
    }

    GetStart(){return this.#start;}
    GetEnd(){return this.#end;}
    GetCp1(){return this.#cp1;}
    GetCp2(){return this.#cp2;}

    /** Sets the absolute control points for painting on canvas. */
    #updateAbsoluteControlPoints() {
        let direction = this.#start.GetDifferencesTo(this.#end);
        this.#cp1 = this.#start.AddTo(direction.MultiplyWith(this.#cubicCp1));
        this.#cp2 = this.#start.AddTo(direction.MultiplyWith(this.#cubicCp2));
    }

    /**
     * Use this mehtod to update the bezier curve and get a smooth changing curve
     * @param {Point} start New start value
     * @param {Point} end New end value
     */
    Update(start, end) {
        this.#start = start;
        this.#end = end;
        if (this.#cubicCp1.Equals(this.#newCubicCp1)) {
            this.#newCubicCp1 = new Point(getRandom(-1, 1), getRandom(-1, 1));
            this.#variableAdaption.x = this.#adaption.x;
        }
        if (this.#cubicCp2.Equals(this.#newCubicCp2)) {
            this.#newCubicCp2 = new Point(getRandom(-1, 1), getRandom(-1, 1));
            this.#variableAdaption.y = this.#adaption.y;
        }

        this.#cubicCp1.AdaptToNewPoint(this.#newCubicCp1, this.#variableAdaption.x);
        this.#cubicCp2.AdaptToNewPoint(this.#newCubicCp2, this.#variableAdaption.y);

        this.#variableAdaption.MultiplSelfyWithScalar(1.1);

        this.#updateAbsoluteControlPoints();
    }


    // Die cps müssen noch cubic genannt werden und diese Rechnung im Ctor muss in die Update-Methode um die kubische und bewegte Kurve in das aktuelle Pixelsystem zu überttragen
}