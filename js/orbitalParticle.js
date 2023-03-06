/** Helper class for configuring each particles. Values in here are default values. */
class ConfigOrbitalParticle {

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

    /** Rotation of the orbital ellipse of a particle 
     * @type {particleParameter}
     */
    Theta = new particleParameter(
        0,
        359.9,
        0.1,
        0);

    /**
     * Adaption factor for a new orbital center position relative to actual orbitalCenter.
     * #default: 0.03
     * 
     * 1.0 means orbitalCenter = newOrbitalCenter
     * 0.0 means orbitalCenter will never reach new orbitalCenter. 
     * @type {number}
     */
    OrbitalCenterAdaption = 0.03;

    /** Default colour for particles.
     * @type {Color} Like '255,255,255';  
     */
    Color = new Color(255, 255, 255);
}

/**
 * Class for generating the particles.
 * Class also provides methods to compute the positions, velocities, directions, sizes and colors of the particles. 
 */
class OrbitalParticle {
    /** 
     * Map<number, OrbitalParticle> to identify the closest particles to the current particle. 
     * 1: number: index of actual particle
     * 2: OrbitalParticle: actual particle 
     * 
     * The parameters used to decide which and how many particles are closest to the current particle must be managed by the parent instance.
     * @type {Map<number, OrbitalParticle>}
     * */
    Closest; // Use this as map/dict for linked particles with a certain maximum distance to paint lines between those particles.

    /**
     * Map<number, number> for the opacity for the ends of the connecting lines.
     * 1: number: index of a certain particle
     * 2: number: opacity of that certain particle 
     * 
     * This opacity is used to draw the connecting lines between two particles. Each particle contains a value 
     * for its opacity for each nearby particle, which results from the distance to this nearby particle. 
     * The connecting line is drawn using a linear colour gradient. 
     * The values of the opacity ensure that the line becomes "darker" towards this nearby particle.
     * 
     * @type {Map<number, number>} 
     */
    Opacities;

    /**
     * Map<number, boolean> to find out whether this line already exists.
     * 
     * 1: number: index of a certain particle
     * 2: bool: true if line exists 
     * 
     * In the main loop, it is of course iterated over all particles. If two particles A and B are close enough to draw a line, care must be 
     * taken that this line is only drawn from A to B. As soon as both lines would be drawn, the darkening of the lines no longer works.
     * @type {Map<number, boolean>}  
     */
    Lines;

    /** Particle configuration 
     * @type {ConfigOrbitalParticle}
    */
    #config;

    /**
     * This is an auxiliary variable that specifies the index of the particle in an array. Reasons.
     * Performance reasons.
     * @type {number}
     */
    #index;

    /** 
     * Contains the parameters of the rectangle in which the particle is displayed.
     * These are, height, width, coordinates of the corners.
     * @type {Rectangle}
     */
    #referenceSystem;

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
     * @type {Point}
     */
    #position;

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

    /** All particles move in rotating ellipses around the mouse cursor. Theta indicates the rotation of the ellipse.  
     * @type {particleParameter}
     */
    #theta;

    /** The direction of rotation of the particles. Some should move clockwise and some against. 
     * This value is -1 or 1.
     * @type {number}
    */
    #diretionOfRotation;

    /**
     * If true, the particle is in the transient process. The settling process continues until the current position of the 
     * particle is very close to 'newOrbitalCenter' (UpdateParameters).
     */
    #init;

    /**
     * Ctor
     * The position of each particle is primarily derived directly from orbitalStartPosition. The value #angle is changed per iteration by the configurable value #speed. 
     * #angle indicates the mathematical angular position of the particle relative to #orbitalCenter. The actual #position of the particle is then calculated by further 
     * parameters such as #orbitX, #orbitY and #theta.
     * 
     * @param {ConfigOrbitalParticle} config Particle configuration
     * @param {number} index Index of particle in an array
     * @param {Rectangle} referenceSystem The reference system in which the particle moves.
     * @param {Point} orbitalStartPosition Start value for the orbital centre of particle motion. Value is deep copied, dont worry bout refs.
     * @param {number} angle Start value for the incremental angle calculation of the particle.
     */
    constructor(config, index, referenceSystem, orbitalStartPosition, angle) {
        this.#config = config;
        /**
         * Arcane numbers everywhere you look. At the beginning, the adaptation is reduced so that the transient looks nicer:-) After the swing-in applies:
         * this.#orbitalCenterAdaption = config.OrbitalCenterAdaption
         */
        this.#orbitalCenterAdaption = config.OrbitalCenterAdaption * 0.2;
        this.#referenceSystem = referenceSystem;
        this.#color = config.Color.Copy();
        this.#proximity = new Proximity();
        this.#diretionOfRotation = changeSignRandom();
        this.#index = index;

        this.Closest = new Map();
        this.Opacities = new Map();
        this.Lines = new Map();

        // Positions
        this.#position = orbitalStartPosition.Copy();
        this.#orbitalCenter = orbitalStartPosition.Copy();
        this.#angle = angle;

        // The image of the particles is deterministic at the beginning because no initial values were determined by chance.

        // Speed
        this.#speed = config.Speed.Clone();
        this.#speed.RandomizeChangeRate();

        // Size
        this.#size = config.Size.Clone();
        this.#size.RandomizeChangeRate();

        // Orbit
        this.#orbitX = config.OrbitX.Clone();
        this.#orbitX.RandomizeChangeRate();
        //this.#orbitX.RandomizeCurrentValue();

        this.#orbitY = config.OrbitY.Clone();
        this.#orbitY.RandomizeChangeRate();
        //this.#orbitY.RandomizeCurrentValue();


        // Theta/rotation
        this.#theta = config.Theta.Clone();
        this.#theta.RandomizeChangeRate();

        this.#init = true;
    }

    /**
     * @returns {Point} Returns the position of the particle.
     */
    GetPosition() {
        return this.#position;
    }

    /**
     * @returns {number} Returns the current value of the size of the particle.
     */
    GetSize() {
        return this.#size.CurrentValue;
    }

     /**
     * Returns the color as string wiht a opacity to be defined in the arguments..
     * @param {number}    randomOpacity Random opacity [0.0, 1.1]
     * @returns {string}  Color like 'rgba(255,0,255, 0.7)'
     */
    GetColorRgbaRandomOpacity(randomOpacity) {
        return this.#color.Get_Rgba_StringRandomOpacity(randomOpacity);
    }

    /**
    * @returns {string} Color of the particle like 'rgb(255, 0, 255)'
    */
    GetColorRgb() {
        return this.#color.Get_Rgb_String();
    }

    /**
    * @returns {string} Color of the particle like 'rgba(255, 0, 255, 0.6)'
    */
    GetColorRgba() {
        return this.#color.Get_Rgba_String();
    }

    /**
     * Sets a new color to the particle.
     * @param {Color} newColor Like '255, 123, 244'
     */
    SetColor(newColor) {
        this.#color = newColor;
    }

    /**
     * Returns alpha of particle color.
     * @returns {number} Alpha value of particle color.
     */
    GetAlpha() {
        return this.#color.A;
    }

    /**
     * Sets alpha of particle color.
     * @param {number} alpha New alpha of particle. 
     */
    SetAlpha(alpha) {
        this.#color.A = alpha;
    }

    /** @returns {number} Returns the index of the particle in an array. */
    GetIndex() {
        return this.#index;
    }

    /**
     * @returns {boolean} If true, the particle is in the transient process.
     */
    IsInit() {
        return this.#init;
    }

    /**
     * Set max values of orbital range.
     * @param {number} xmaX New max value for orbitX.
     * @param {number} maxY New max value for orbitY.
     */
    UpdateOrbit(xmaX, maxY) {
        this.#orbitX.MaximumValue = xmaX;
        this.#orbitY.MaximumValue = maxY;
    }

    /**
     * Update function for the parameters of a particle. This function can be called at each loop pass. 
     * The iteration of the particle actually takes place exclusively by moving the orbital centre and changing the angular position. 
     * @param {Point} newOrbitalCenter Center of the orbit of the current particle. This is mainly the mouse position. 
     */
    UpdateParameters(newOrbitalCenter) {
        this.#orbitalCenter.AdaptToNewPoint(newOrbitalCenter, this.#orbitalCenterAdaption);

        /** TODO: The more I come to this place, the more I think this doesn't belong here. Maybe the Canvas has to tell the particles 
         * when they are in the transient process. Then you would only check for this.#init here. */
        if (this.#init) {
            this.#position = this.#orbitalCenter;

            /** 1.009 
             * A beautiful arcane number that helps keep the speed of particles approaching the centre "nearly" constant. :-) 
             * The smaller the distance between the new orbital centre and the current orbital centre, the smaller the absolute pixel increment. 
             * And therefore the adaptation factor must be constantly increased. 
             * Hmmm, if this were a real particle engine, the speed and direction of a particle would be available as a vector. And the particles would have weight 
             * and attraction... but that might be going too far.
             */
            this.#orbitalCenterAdaption *= 1.009; // 
            if (this.#position.distanceTo(newOrbitalCenter) < 5) {
                // End init mode
                this.#init = false;
                // Reset adaption
                this.#orbitalCenterAdaption = this.#config.OrbitalCenterAdaption;
                // Important. If theta is 0 in all particles you will see always the same pattern in movement of lots of particles.
                this.#theta.RandomizeCurrentValue();
            }
            return;
        }

        this.#angle += this.#speed.CurrentValue;

        // Multiplication with changeSignRandom() ensures that the particles move either clockwise or anti-clockwise.
        this.#position = this.#orbitalCenter.GetOrbitalPoint(this.#angle * this.#diretionOfRotation, this.#orbitX.CurrentValue, this.#orbitY.CurrentValue);

        // Rotate
        this.#position = Rotate(this.#orbitalCenter, this.#position, this.#theta.CurrentValue);
        this.#theta.IncreaseCurrentValue();

        // Change orbit
        // Hier gibts noch irgendwo ein Problem mit der Bahnberechnung
        this.#orbitX.IncreaseCurrentValue();
        this.#orbitY.IncreaseCurrentValue();

        // Change speed
        this.#speed.IncreaseCurrentValue();

        // Change the size per update
        this.#size.IncreaseCurrentValue();

        // Update proximity
        this.#proximity.Update(this.#referenceSystem, this.#position);
    }

    /**
     * This method updates the colour of the particle depending on its position in the rectangle.
     * @param {Color[]} cornerColors  
     * @param {number} factorForUsingLogisticColorFunction 
     */
    UpdateColor(cornerColors, factorForUsingLogisticColorFunction) {
        // Color
        if (typeof this.#proximity !== 'undefined') {
            let alpha = this.#color.A;
            this.#color = getColor(cornerColors, this.#proximity.GetProximities(), factorForUsingLogisticColorFunction);
            this.#color.A = alpha;
        }
        else {
            this.#color.SetWhite();
        }
    }

    UpdateAlpha(alpha) {
        this.#color.A = alpha;
    }
}
