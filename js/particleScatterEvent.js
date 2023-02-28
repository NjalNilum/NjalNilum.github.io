class particleScatterEvent {
    /** Array of particles to show on canvas 
     * @type {ScatterParticle[]}
     */
    #particles;

    /**
     * Array for the beziers curves
     * @type {Bezier[]}
     */
    #beziers;

    /**
     * The target positions correspond directly with the particles. Each particle has its own target position, which is circular and equidistant to the centre of the circle.
     * @type {Point[]}
     */
    #targetPositions;

    /** Opacity of the particles in this scatter object. 
     * Default / start value is 1.0
     * @type {number} 1.0 to 0.0
     */
    #opacity;

    /** Colour of actual scatter event. The colour of a sctter event depends on its position in the canvas.
     * @type {Color} Color array like this [155, 255, 255];  
    */
    #color;

    /**
     * Ctor.
     * Current value is set randomly between min and max.
     * 
     * @param {number} amount           Amount of particles
     * @param {Point} centerPosition    Center position where the movement starts
     * @param {Rectangle} referenceRect The reference system with the basal values of the rectangle to be drawn in.
     * @param {Color[]} cornerColors    The corner colors of the canvas.
     */
    constructor(amount, centerPosition, referenceRect, cornerColors) {
        let particleConfig = new ConfigScatterParticle();
        particleConfig.Speed = new particleParameter(0.004, 0.02, 0.001, 0.01);
        particleConfig.Size = new particleParameter(1, 1, 0, 1);
        particleConfig.OrbitX = new particleParameter(10, 400, 1, 3);
        particleConfig.OrbitY = new particleParameter(10, 400, 1, 3);
        particleConfig.OrbitalCenterAdaption = 0.003;
        particleConfig.MaxPositions = 30;

        let proximity = new Proximity();
        proximity.Update(referenceRect, centerPosition);
        this.#color = getColor(cornerColors, proximity.GetProximities(), 0.7);

        this.#opacity = 1;
        this.#setUpParticles(amount, centerPosition, referenceRect, particleConfig);
    }

    /** Returns false if opacity is smaller than EPS, otherwise true. */
    IsAlive() {
        if (this.#opacity <= EPS) {
            return false;
        }
        return true;
    }

    /** MustCall
     * On every iteration update the parameter of the currunt scatter.
     */
    UpdateScatter() {
        this.#particles.forEach(particle => {
            particle.UpdateParameters(this.#targetPositions[particle.GetIndex()]);
            this.#updateBezier(particle);
            particle.UpdateAlpha(this.#opacity);
        });
        this.#opacity *= 0.98;
        this.#color.A = this.#opacity;
    }

    /**
     * @returns {string} Color of the particle like 'rgb(255, 0, 255)'
     */
    GetColorRgba() {
        return this.#color.Get_Rgba_String();
    }

    /** Return all particles for painting on canvas. 
     * @returns {ScatterParticle[]}
    */
    GetParticles() {
        return this.#particles;
    }

    /**
     * 
     * @param {number} index 
     * @returns {Bezier}
     */
    GetBezier(index) {return this.#beziers[index];}

    /**
    * setUpParticles dependet to the configuration.
    * Note this method empties the particle array.
    * @param {number} amount       Amount of particles
    * @param {Point} centerPosition    Center position where the movement starts
    * @param {Rectangle} referenceRect The reference system with the basal values of the rectangle to be drawn in.
    * @param {configOrbitalParticle} particleConfig These are the default configuration parameters of the particles.
    */
    #setUpParticles(amount, centerPosition, referenceRect, particleConfig) {
        this.#particles = [];
        this.#beziers = [];
        this.#targetPositions = [];
        var distanceBetweenParticles = PI2 / amount;

        for (let index = 0; index < amount; index++) {

            var angle = index * distanceBetweenParticles;
            var x = Math.cos(angle) * referenceRect.Width();
            x += referenceRect.Width() / 2;
            var y = Math.sin(angle) * referenceRect.Height();
            y += referenceRect.Height() / 2;

            this.#targetPositions.push(new Point(x, y));
            var particle = new ScatterParticle(particleConfig, index, referenceRect, centerPosition, angle);
            this.#particles.push(particle);
            var bezier = new Bezier(particle.GetPosition(), particle.GetPosition(), new Point(0.05, 0.05));
            this.#beziers.push(bezier);
        }
    }

    /**
     * 
     * @param {ScatterParticle} particle 
     */
    #updateBezier(particle)
    {
        let positions = particle.GetPositions();
        this.#beziers[particle.GetIndex()].Update(positions[positions.length-1], positions[0]);
    }
}