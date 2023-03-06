/** Helper class for configuring each scatter particle. Values in here are default values. */
class ConfigScatterParticle {

    /**
     * Angular velocity of a particle in radians (2*PI = 360°).
     * 
     * This speed is very inaccurate because it is directly related to the frame rate of the browser/computer. 
     * Each time the main loop "requestAnimationFrame" is run, the values of the particles are also recalculated.
     * This speed is added to the angular position of the current particle at each loop pass.
     * Don't set the maximum higher than 0.03 (3% of framerate), otherwise animation won't look smooth.  
     * @type {particleParameter}
     */
    Speed = new particleParameter(
        0.004,
        0.02,
        0.00001,
        0.004);

    /**
     * Particle size in pixel.
     * The particles do not change their values in the same way in each loop pass, but on the basis of a changerate.   
     * @type {particleParameter}
     */
    Size = new particleParameter(
        0.5,
        3,
        0.03,
        0.8);

    /** X orbit of particle in pixels. 
     * The changerate should not be too high for these parameters. Even a rate of change of 1 pixel per iteration leads to the track of 
     * the movement no longer being differentiable. This means that the circular path of a particle will have "corners" and "edges". 
     * @type {particleParameter}
     */
    OrbitX = new particleParameter(
        10,
        300,
        0.3,
        5);

    /** Y orbit of particle in pixels 
     * The changerate should not be too high for these parameters. Even a rate of change of 1 pixel per iteration leads to the track of 
     * the movement no longer being differentiable. This means that the circular path of a particle will have "corners" and "edges". 
     * @type {particleParameter}
     */
    OrbitY = new particleParameter(
        10,
        300,
        0.3,
        5);

    /**
     * Adaption factor for a new orbital center position relative to actual orbitalCenter.
     * #default: 0.03
     * 
     * 1.0 means orbitalCenter = newOrbitalCenter
     * 0.0 means orbitalCenter will never reach new orbitalCenter. 
     * @type {number}
     */
    OrbitalCenterAdaption = 0.001;

    /** Default colour for particles.
     * @type {Color} Like '255,255,255';  
     */
    Color = new Color(255, 255, 255);

    /** Sets the maximum size of the position field.
     * Default is 30.
     * @type {number}
     */
    MaxPositions = 30;
}

/**
 * Class for generating the particles.
 * Class also provides methods to compute the positions, velocities, directions, sizes and colors of the particles. 
 */
class ScatterParticle {

    /** Particle configuration 
     * @type {ConfigScatterParticle}
    */
    #config;

    /**
     * This is an auxiliary variable that specifies the index of the particle in an array. Reasons.
     * Performance reasons.
     * @type {number}
     */
    #index;

    /** Color of actual particle. The colour of a particle depends on its position in the canvas.
     * @type {Color} Color array like this [155, 255, 255];  
    */
    #color;

    /**
     * Proximity contains an array that describes the proximity of the current particle to the respective corner point of the rectangle. Like this:
     * 
     *      [1,   0,   0,   0]:      // The particle is located at point A, top left of the rectangle.
     *      [0.5, 0.5, 0.5, 0.5]:    // The particle is located exactly in the middle of the rectangle.
     * @type {Proximity}
     */
    #proximity;

    /** This is the true position of the particle in the reference frame. This position is used for drawing..  
     * @type {Point[]}
     */
    #positions;

    /** Orbital centre around which the current particle moves. 
     * A particle is in an elliptical motion around a certain centre. This centre is called the #orbitalCenter.
     * 
     * This value is only significant during transient processes. After some iterations, "TrailingMousePosition == #orbitalCenter" 
     * should apply.  All particles always move around the mouse cursor position. This means that the TrailingMousePosition 
     * could always be used as well. However, this parameter exists to allow for transitions that depend on different positions.
     * 
     * @type {Point}
     */
    #orbitalCenter;

    /**
     * Adaption factor for a new orbital center position relative to actual orbitalCenter.
     * #default: 0.03
     * 
     * 1.0 means orbitalCenter = newOrbitalCenter
     * 0.0 means orbitalCenter will never reach new orbitalCenter. 
     * @type {number}
     */
    #orbitalCenterAdaption;

    /** Mathematical angular position with respect to the centre of the orbit (#orbitalCenter) of the current particle in radians. 
     * #angle and #orbitalCenter are auxiliary values to calculate the real position of the particle. #angle is responsible for the actual iterative movement.
     * @type {number}
     */
    #angle;

    /** Speed of actual particle.  
     * This is the angular velocity of the current particle in radians per iteration.
     * @type {particleParameter} index
     */
    #speed;

    /** Size of particle in pixel  
     * @type {particleParameter}
     */
    #size;

    /** Orbit in pixels for x  
     * @type {particleParameter}
     */
    #orbitX;

    /** Orbit in pixels for y  
     * @type {particleParameter}
     */
    #orbitY;

    /** The direction of rotation of the particles. Some should move clockwise and some against. 
     * This value is -1 or 1.
     * @type {number}
    */
    #diretionOfRotation;

    /**
     * Ctor
     * The position of each particle is primarily derived directly from orbitalStartPosition. The value #angle is changed per iteration by the configurable value #speed. 
     * #angle indicates the mathematical angular position of the particle relative to #orbitalCenter. The actual #positions of the particle is then calculated by further 
     * parameters such as #orbitX, #orbitY and #theta.
     * 
     * @param {ConfigScatterParticle} config Particle configuration
     * @param {number} index Index of particle in an array
     * @param {Point} orbitalStartPosition Start value for the orbital centre of particle motion. Value is deep copied, dont worry bout refs.
     * @param {number} angle Start value for the incremental angle calculation of the particle.
     */
    constructor(config, index, orbitalStartPosition, angle) {
        this.#config = config;
        this.#orbitalCenterAdaption = config.OrbitalCenterAdaption //* 0.2;
        this.#color = config.Color;
        this.#proximity = new Proximity();
        this.#diretionOfRotation = changeSignRandom();
        this.#index = index;
        this.#positions = [];

        // Positions
        this.#positions.push(orbitalStartPosition.Copy());
        this.#orbitalCenter = orbitalStartPosition.Copy();
        this.#angle = angle;

        // Speed
        this.#speed = config.Speed.Clone();
        this.#speed.RandomizeChangeRate();

        // Size
        this.#size = config.Size.Clone();
        this.#size.RandomizeChangeRate();

        // Orbit
        this.#orbitX = config.OrbitX.Clone();
        this.#orbitX.RandomizeChangeRate();

        this.#orbitY = config.OrbitY.Clone();
        this.#orbitY.RandomizeChangeRate();
    }

    /**
     * @returns {Point} Returns the position of the particle.
     */
    GetPosition() {
        return this.#positions[this.#positions.length-1];
    }

    /**
     * @returns {Point[]} Returns the last n positions of the particle.
     */
    GetPositions() {
        return this.#positions;
    }

    /**
     * @returns {string} Color of the particle like '255, 0, 255, 0.89'
     */
    GetColorRgba() {
        return this.#color.Get_Rgba_String();
    }

    /**
    * @returns {string} Color of the particle like 'rgb(255, 0, 255)'
    */
    GetColorRgb() {
        return this.#color.Get_Rgb_String();
    }

    /**
     * Sets a new color to the particle.
     * @param {Color} newColor Like '255, 123, 244'
     */
    SetColor(newColor) {
        this.#color = newColor;
    }

    /** @returns {number} Returns the index of the particle in an array. */
    GetIndex() {
        return this.#index;
    }

    /**
     * Update the parameters per iteration.
     * @param {Point} newOrbitalCenter New center of the particle.
     */
    UpdateParameters(newOrbitalCenter) {
        this.#orbitalCenter.AdaptToNewPoint(newOrbitalCenter, this.#orbitalCenterAdaption);

        let tempPosition = this.#orbitalCenter.Copy();

        this.#orbitalCenterAdaption *= 1.01; // 
        if (tempPosition.distanceTo(newOrbitalCenter) < 5) {
            // Reset adaption
            this.#orbitalCenterAdaption = this.#config.OrbitalCenterAdaption;

        }
        this.#angle += this.#speed.CurrentValue;

        // Multiplication with changeSignRandom() ensures that the particles move either clockwise or anti-clockwise.
        this.#positions.push(this.#orbitalCenter.GetOrbitalPoint(this.#angle * this.#diretionOfRotation, this.#orbitX.CurrentValue, this.#orbitY.CurrentValue));
        if (this.#positions.length > this.#config.MaxPositions) {
            this.#positions.shift();
        }
        
        // Change orbit
        // Hier gibts noch irgendwo ein Problem mit der Bahnberechnung
        this.#orbitX.IncreaseCurrentValue();
        this.#orbitY.IncreaseCurrentValue();

        // Change speed
        this.#speed.IncreaseCurrentValue();
    }

    /**
     * This method updates the colour of the particle depending on its position in the rectangle.
     * @param {Color[]} cornerColors  
     * @param {number} factorForUsingLogisticColorFunction 
     */
    UpdateColor(cornerColors, factorForUsingLogisticColorFunction) {
        // Color
        if (typeof this.#proximity !== 'undefined') {
            this.#color = getColor(cornerColors, this.#proximity.GetProximities(), factorForUsingLogisticColorFunction);
        }
        else {
            this.#color.SetWhite();
        }
    }

    UpdateAlpha(alpha) {
        this.#color.A = alpha;
    }
}
