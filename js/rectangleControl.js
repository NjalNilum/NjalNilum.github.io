/** Configuration class for RectangleControl */
class ConfigRectangleControl {
    /**  
    * Adaption factor for trailed mouse position relative to actual mouse position.
    * #default: 0.03
    * 
    * 1.0 means TrailingMousePositon = MousePosition
    * 0.0 means TrailingMousePositon will never reach mouse position. 
    * @type {number}
   */
    TrailingMousePositionAdaption = 0.03;
}

/**
 * Control class for browser window. This class cares for mouse and touch events, mouse cursor positions,
 * corners of the rectangle and the proximity values relative to the rectangles corners
 */
class RectangleControl {

    /**
     * If active, all particles follow the trailing mouse position.
     * If deactivated all particles move around screen center.
     */
    #mouseTrackingActive = false;

    /** Dimensions of the used recangle.
     * @type {Rectangle}
     */
    #referenceRect;

    /** Device Pixel ratio 
     * @type {number}
    */
    #dpr;

    /**
     * Reference to the canvas control object that is used to paint the particles.
     */
    #particleCanvas;

    /** 
     * Given audioPlayer for adjusting the volumes. Suboptimum. This should perhaps better be an optional callback. Anyway. 
     * I didn't want to overuse the move events and hope that the performance will be somewhat spared as a result. 
     * The move events could also have been subscribed to in the audio player. Maybe.
     * @type {AudioPlayer}
     * */
    #audioPlayer;

    /**
     * This array shows how close the mouse cursor is to each corner of the rectangle. The array is normalised. 
     * 1 means the mouse cursor is in a corner and 0 means the mouse cursor is the maximum distance from the corner.
     * @type {Proximity}
     */
    #mouseProximities;

    /**
     * Mouse cursor postion relative to browser window.
     * @type {Point}
     */
    #mousePosition;
    /**
     * Mouse trailing position relative to browser window.
     * @type {Point}
     */
    #trailingMousePosition;

    /**  
    * Adaption factor for trailed mouse position relative to actual mouse position.
    * #default: 0.03
    * 
    * 1.0 means TrailingMousePositon = MousePosition
    * 0.0 means TrailingMousePositon will never reach mouse position. 
   */
    #trailingMouseAdatpion

    /** Internal helper. Reasons. 
     * @type {boolean}*/
    #hasStarted;

    /**
     * Ctor.
     * @param {ConfigRectangleControl} config Config parameters
     * @param {Rectangle} refercenSystem The reference system with the basal values of the rectangle to be drawn in.
     * @param {CanvasForParticle} canvasToPaintOn Canvas to paint on.
     * @param {AudioPlayer} audioPlayer Valid audioplayer to set the volume on mouse move.
     */
    constructor(config, refercenSystem, canvasToPaintOn, audioPlayer) {
        this.#dpr = window.devicePixelRatio || 1;
        this.#particleCanvas = canvasToPaintOn;
        this.#trailingMouseAdatpion = config.TrailingMousePositionAdaption;
        this.#mousePosition = new Point(0, 0);
        this.#trailingMousePosition = new Point(0, 0);
        this.#audioPlayer = audioPlayer;
        this.#referenceRect = refercenSystem;
        this.#mouseProximities = new Proximity();

        this.#addEvents();
        this.UpdateRectAndMovement();
        this.#calculateMousePointerProximities();


        this.#hasStarted = false;
    }

    /** Returns the dimensions of the current rectangle as a rectangle object. */
    GetReferenceRectangle() {
        return this.#referenceRect;
    }

    /**
     * Returns mouse cursor postion relative to browser window.
     */
    MousePosition() {
        return this.#mousePosition;
    }

    /**
     * Returns mouse trailing position relative to browser window.
     */
    TrailingMousePosition() {
        return this.#trailingMousePosition;
    }

    /**
     * Start animations, start everything.
     */
    Start() {
        if (!this.#hasStarted) {
            this.#hasStarted = true;
            this.#loop();
        }
    }

    Pause() {
        this.#hasStarted = false;
    }

    Reset() {
        this.#hasStarted = false;
        this.#resetMousePositionToCenter();
        this.#particleCanvas.ResetParticles();
        this.UpdateRectAndMovement();
        this.#particleCanvas.UpdateOrbit(this.#mouseTrackingActive);
    }

    /**
     * Activate/Deactivate mouse tracking mode. If active parzticles will follow mouse pointer
     * @param {boolean} toActive 
     */
    SetMouseTracking(toActive) {
        this.#mouseTrackingActive = toActive;
        this.#particleCanvas.UpdateOrbit(this.#mouseTrackingActive);
        if (!this.#mouseTrackingActive) {
            this.#resetMousePositionToCenter();
        }
    }

    /** */
    UpdateRectAndMovement() {
        this.#referenceRect.UpdateRect(window.innerWidth * this.#dpr, window.innerHeight * this.#dpr);
        this.#particleCanvas.UpdateDimensions(this.#referenceRect.Width(), this.#referenceRect.Height());
        
        if (!this.#mouseTrackingActive) {
            this.#resetMousePositionToCenter();
        }
    }

    /**
     * Main Loop.
     * The loop must be triggered once and is then called by the browser itself via requestAnimationFrame. 
     * Depending on the hardware (and presumably the browser), the frequency of this loop determines the frame rate of the particle image.
     * All drawing operations must be triggered in this loop. 
     * All values that are to change per iteration must also be triggered via this loop.
     */
    #loop() {

        if (this.#hasStarted) {
            this.#updateTrailingMousePosition();

            this.#particleCanvas.UpdatePerIteration();
            this.#particleCanvas.DrawCenter();
            this.#particleCanvas.DrawParticles();

            // This binding is necessary because the function is called by RequestAnimationFrame without the current context and this is then unknown. 
            // This binding ensures that this is always known. 
            window.requestAnimationFrame(_.bind(this.#loop, this));
        }
    }

    /**
     * Adding mouse and touch events.
     */
    #addEvents() {
        window.addEventListener('resize', () => {
            this.UpdateRectAndMovement();
        });

        let isTouch = 'ontouchstart' in window;
        if (isTouch) {
            /**
            * Touchmove on whole browser window. 
            * */
            document.addEventListener("touchmove", (event) => {
                if (event.touches.length === 1) {
                    event.preventDefault();
                }
                this.#mouseMoveStuff(event.touches[0].pageX * this.#dpr, event.touches[0].pageY * this.#dpr);
            });

            /**
             * Touchstart on whole browser window. 
             * */
            document.addEventListener("touchstart", (event) => {
                // if (event.touches.length === 1) {
                //     event.preventDefault();
                // }
                // this.#mouseMoveStuff(event.touches[0].pageX * this.#dpr, event.touches[0].pageY * this.#dpr);
                this.#particleCanvas.UpdateOrbit(this.#mouseTrackingActive);
            });

            /**
             * Touchend on whole browser window. 
             * */
            document.addEventListener("touchend", (event) => {
                this.#resetMousePositionToCenter();
                this.#particleCanvas.UpdateOrbit(this.#mouseTrackingActive);
            });
        }

        // 
        /**
         * Mousemove on whole browser window. 
         * */
        document.addEventListener("mousemove", (event) => {
            this.#mouseMoveStuff(event.clientX * this.#dpr, event.clientY * this.#dpr);
        });

        /**
         * Mouseenter on whole browser window. 
         * */
        document.addEventListener("mouseenter", (event) => {
            this.#particleCanvas.UpdateOrbit(this.#mouseTrackingActive);
        });

        /**
         * Mouseleave on whole browser window. 
         * */
        document.addEventListener("mouseleave", (event) => {
            this.#resetMousePositionToCenter();
            this.#particleCanvas.UpdateOrbit(this.#mouseTrackingActive);
        });

    }

    /**
     * Method to set the new mouse position, calculate the proximites and set the volume.
     * @param {number} newX New mouse position X
     * @param {number} newY New mouse position Y
     */
    #mouseMoveStuff(newX, newY) {
        if (this.#mouseTrackingActive) {
            this.#mousePosition.x = newX;
            this.#mousePosition.y = newY;

            this.#calculateMousePointerProximities();
            this.#audioPlayer.SetVolume(this.#mouseProximities.GetProximities());
        }
    }

    /**
     * Resets mouse position and proximities to center of screen
     */
    #resetMousePositionToCenter() {
        this.#mousePosition.x = this.#referenceRect.Width() / 2;
        this.#mousePosition.y = this.#referenceRect.Height() / 2;

        this.#calculateMousePointerProximities();
        this.#audioPlayer.SetVolume(this.#mouseProximities.GetProximities());

    }

    /** Update the trailed mouse position. 
     * With this.#trailingMouseAdatpion the adaptation speed can be adjusted.
     */
    #updateTrailingMousePosition() {
        this.#trailingMousePosition.x += (this.#mousePosition.x - this.#trailingMousePosition.x) * this.#trailingMouseAdatpion;
        this.#trailingMousePosition.y += (this.#mousePosition.y - this.#trailingMousePosition.y) * this.#trailingMouseAdatpion;
    }

    /**
     * Calculates the proximity of the mouse pointer relative to each corner of the rectangle (browser window).
     * I.e if mouse pointer is at top left exactly the resulting array looks like so [1,0,0,0].
     * Proximity values are normalized [0,1], where 0 means the maximum distance and 1 means the closest position to
     * a specified corner position. This will only work for rectangles btw.
     */
    #calculateMousePointerProximities() {
        this.#mouseProximities.Update(this.#referenceRect, this.#trailingMousePosition);
    }
}