let audioPlayer = new AudioPlayer();
const dpr = window.devicePixelRatio || 1;
let refercenSystem = new Rectangle(window.innerWidth * dpr, window.innerHeight * dpr)

let configCanvas = new ConfigParticleCanvas();
configCanvas.DomCanvas = document.getElementById('canvasParticle');
configCanvas.Dpr = window.devicePixelRatio || 1;
configCanvas.ParticleCount = 45;
configCanvas.GlobalFillStyle = 'rgba(1,1,1,0.15)';
configCanvas.TrailingMousePositionAdaption = 0.03;
configCanvas.MaximumLinkDistances = 250 * dpr;
configCanvas.MaximumNumberOfLines = 3;

// The default values for the configuration of the particles can be found in the particleParameter class.
let particleConfig = new ConfigOrbitalParticle();
particleConfig.Speed = new particleParameter(0.004, 0.01, 0.00001, 0.004);
particleConfig.Size = new particleParameter(0.5, 3, 0.003, 0.8);
particleConfig.OrbitX = new particleParameter(10, 300, 0.3, 0);
particleConfig.OrbitY = new particleParameter( 10,300, 0.3, 0);
particleConfig.MaximumMouseMoveOrbit = 300;
particleConfig.Theta = new particleParameter( 0,359.9, 0.1, 0);
particleConfig.OrbitalCenterAdaption = 0.03;

let particleCanvas = new CanvasForParticle(configCanvas, particleConfig, refercenSystem);

let configRectControl = new ConfigRectangleControl();
configRectControl.TrailingMousePositionAdaption = 0.03;
let rectControl = new RectangleControl(configRectControl, refercenSystem, particleCanvas, audioPlayer);

// this starts all
rectControl.Start();



function PressPlay() {
    audioPlayer.Play();
    particleCanvas.DoColorUpdates = true;

    rectControl.Start();
}

function PressPause() {
    audioPlayer.Pause();

    rectControl.Pause();
}

function PressStop() {
    audioPlayer.Stop();
    rectControl.Reset();
    particleCanvas.DoColorUpdates = false;
}