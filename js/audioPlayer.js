/**
 * Class for playing four audio streams, one per corner of the browser window.
 * The volume of the audio stream depends on the mouse position. I.g. stream A should be loudest, when mouse pointer is near corner A of the rectangle (top left).
 */
class AudioPlayer {
    #volumeAdjust = 1;

    #volumeArray = [0, 0, 0, 0];

    #intervalId = -1;

    constructor() {
        this.Audio_A = new Audio("/mp3/leftTop.mp3");
        this.Audio_B = new Audio("/mp3/rightTop.mp3");
        this.Audio_C = new Audio("/mp3/rightBottom.mp3");
        this.Audio_D = new Audio("/mp3/leftBottom.mp3");

        this.Audio_Beat = new Audio("/mp3/baseSub.mp3");
        this.#internSetVolume(this.Audio_Beat, 1);
    }

    /**
     * Internal function to set the volume of the given audio stream.
     * @param {Audio} audio The audio stream to set the volume.
     * @param {number} value The float value [0.0, 1.0] of the volume.
     */
    #internSetVolume(audio, value) {
        if (value > 1) value = 1;
        audio.volume = value;
    }

    /**
     * This audio player uses for audio streams, one for each corner of the rectangle represented by the browser window.
     * This function provides setting the volume of every corner separatly. 
     * I.g. stream A should be loudest, when mouse pointer is near corner A of the rectangle (top left).
     * @param {number[]} array Array within float values to set the volume of the four audio streams. 
     */
    SetVolume(array) {
        for (let i = 0; i < 4; i++) {
            this.#volumeArray[i] = array[i];
        }
        
        this.#setVolumeFromArray(this.#volumeAdjust);
    }

    #setVolumeFromArray(factor)
    {
        this.#internSetVolume(this.Audio_A, this.#volumeArray[0]*factor);
        this.#internSetVolume(this.Audio_B, this.#volumeArray[1]*factor);
        this.#internSetVolume(this.Audio_C, this.#volumeArray[2]*factor);
        this.#internSetVolume(this.Audio_D, this.#volumeArray[3]*factor);
    }

    /**
     * Play the four audio streams. 
     */
    Play() {
        this.Audio_A.play();
        this.Audio_B.play();
        this.Audio_C.play();
        this.Audio_D.play();
    }

    /**
     * Pause the four audio streams. 
     */
    Pause() {
        this.Audio_A.pause();
        this.Audio_B.pause();
        this.Audio_C.pause();
        this.Audio_D.pause();
    }

    /**
    * Pause the four audio streams. 
    */
    Stop() {
        this.Audio_A.pause();
        this.Audio_B.pause();
        this.Audio_C.pause();
        this.Audio_D.pause();

        this.Audio_A.currentTime = 0;
        this.Audio_B.currentTime = 0;
        this.Audio_C.currentTime = 0;
        this.Audio_D.currentTime = 0;
    }

    #updateVolume() {
        if (this.#intervalId != -1) {
            clearInterval(this.#intervalId);
            this.#intervalId = -1;
        }

        this.#volumeAdjust = 0.5;
        this.#intervalId = setInterval( () => {
            this.#updateVolumeAdjust();
        }, 100);
    }

    #updateVolumeAdjust() {
        if (this.#volumeAdjust < 1) {
            this.#volumeAdjust = this.#volumeAdjust * 1.08;
          if (this.#volumeAdjust >= 0.999) {
            this.#volumeAdjust = 1;
            clearInterval(this.#intervalId);
            this.#intervalId = -1;
          }
        }
        this.#setVolumeFromArray(this.#volumeAdjust);
    }

    /**
     * Play impact. 
     */
    PlayImpact() {
        this.#updateVolume();
        
        this.#internSetVolume(this.Audio_Beat, 0);
        this.Audio_Beat.pause();
        this.Audio_Beat.currentTime=0;
        this.#internSetVolume(this.Audio_Beat, 1);
        this.Audio_Beat.play();
    }

}