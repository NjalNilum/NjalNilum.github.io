/**
 * Class for playing four audio streams, one per corner of the browser window.
 * The volume of the audio stream depends on the mouse position. I.g. stream A should be loudest, when mouse pointer is near corner A of the rectangle (top left).
 */
class AudioPlayer {
    constructor() {
        this.Audio_A = new Audio("/mp3/leftTop.mp3");
        this.Audio_B = new Audio("/mp3/rightTop.mp3");
        this.Audio_C = new Audio("/mp3/rightBottom.mp3");
        this.Audio_D = new Audio("/mp3/leftBottom.mp3");

        // check synchronicity between the players
        // this.Audio_A = new Audio("/mp3/lifelike-126735.mp3");
        // this.Audio_B = new Audio("/mp3/lifelike-126735.mp3");
        // this.Audio_C = new Audio("/mp3/lifelike-126735.mp3");
        // this.Audio_D = new Audio("/mp3/lifelike-126735.mp3");

        this.Audio_Beat = new Audio("/mp3/baseSub.mp3");
        this.internSetVolume(this.Audio_Beat, 1);
    }

    /**
     * Internal function to set the volume of the given audio stream.
     * @param {Audio} audio The audio stream to set the volume.
     * @param {number} value The float value [0.0, 1.0] of the volume.
     */
    internSetVolume(audio, value) {
        audio.volume = value;
    }

    /**
     * This audio player uses for audio streams, one for each corner of the rectangle represented by the browser window.
     * This function provides setting the volume of every corner separatly. 
     * I.g. stream A should be loudest, when mouse pointer is near corner A of the rectangle (top left).
     * @param {number[]} array Array within float values to set the volume of the four audio streams. 
     */
    SetVolume(array) {
        this.internSetVolume(this.Audio_A, array[0]);
        this.internSetVolume(this.Audio_B, array[1]);
        this.internSetVolume(this.Audio_C, array[2]);
        this.internSetVolume(this.Audio_D, array[3]);
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

    /**
     * Play impact. 
     */
    PlayImpact() {
        this.internSetVolume(this.Audio_Beat, 0);
        this.Audio_Beat.pause();
        this.Audio_Beat.currentTime=0;
        this.internSetVolume(this.Audio_Beat, 1);
        this.Audio_Beat.play();
    }
}