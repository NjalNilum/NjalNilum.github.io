let audioPlayer = new AudioPlayer();
const dpr = window.devicePixelRatio || 1;
let refercenSystem = new Rectangle(window.innerWidth * dpr, window.innerHeight * dpr)

let configCanvas = new ConfigParticleCanvas();
configCanvas.DomCanvas = document.getElementById('canvasParticle');
configCanvas.Dpr = window.devicePixelRatio || 1;
configCanvas.ParticleCount = 45;
configCanvas.GlobalFillStyle = 'rgba(1,1,1,0.15)';
configCanvas.TrailingMousePositionAdaption = 0.03;
configCanvas.MaximumLinkDistances = 450 * dpr;
configCanvas.MaximumNumberOfLines = 3;
configCanvas.DefaultMaximumMouseMoveOrbit = 100;

// The default values for the configuration of the particles can be found in the particleParameter class.
let particleConfig = new ConfigOrbitalParticle();
particleConfig.Speed = new particleParameter(0.004, 0.01, 0.00001, 0.004);
particleConfig.Size = new particleParameter(0.5, 3, 0.003, 0.8);
particleConfig.OrbitX = new particleParameter(10, 300, 0.4, 1);
particleConfig.OrbitY = new particleParameter( 10,300, 0.4, 1);
particleConfig.Theta = new particleParameter( 0,359.9, 0.1, 0);
particleConfig.OrbitalCenterAdaption = 0.03;

let particleCanvas = new CanvasForParticle(configCanvas, particleConfig, refercenSystem);

let configRectControl = new ConfigRectangleControl();
configRectControl.TrailingMousePositionAdaption = 0.03;
let rectControl = new RectangleControl(configRectControl, refercenSystem, particleCanvas, audioPlayer);

// this starts all
rectControl.Start();


/** Click on pause button */
function PressPause() {
    audioPlayer.Pause();
    rectControl.Pause();
}

/** Click on stop button */
function PressStop() {
    audioPlayer.Stop();
    rectControl.Reset();
    particleCanvas.DoColorUpdates = false;
}

/** Click on PLay button */
function PressPlay() {
    audioPlayer.Play();
    particleCanvas.DoColorUpdates = true;
    rectControl.Start();
}

/** Click event mouse tracking */
function PressMouseTracking() {
    var checkBox = document.getElementById("mouseTracking");
    rectControl.SetMouseTracking(checkBox.checked);
}

/** Click event full screen */
function PressFullScreen() {
    let elem = document.body;
    // ## The below if statement seems to work better ## if ((document.fullScreenElement && document.fullScreenElement !== null) || (document.msfullscreenElement && document.msfullscreenElement !== null) || (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if ((document.fullScreenElement !== undefined && document.fullScreenElement === null) || (document.msFullscreenElement !== undefined && document.msFullscreenElement === null) || (document.mozFullScreen !== undefined && !document.mozFullScreen) || (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)) {
        if (elem.requestFullScreen) {
            elem.requestFullScreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullScreen) {
            elem.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    } else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
    rectControl.UpdateDimensions();
}

/** Click event for hiding all elements. Fuck you, if you do this :-) */
function PressHideNjal() {
    let footer = document.getElementById("footer");
    let header = document.getElementById("header");
    let containerLeft = document.getElementById("containerLeft");
    let containerRight = document.getElementById("containerRight");
    
    if (footer.style.display == '') {
        footer.style.display = 'none';
        header.style.display = 'none';
        containerLeft.style.display = 'none';
        containerRight.style.display = 'none';
    }
    else {
        footer.style.display = '';
        header.style.display = '';
        containerLeft.style.display = '';
        containerRight.style.display = '';
    }
    
}