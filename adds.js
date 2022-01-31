var playButtonMarginRight = "92px"
var me = new Audio("rrr.mp3");
var infoIsVisible = true;

// Reduce the buttons on mobile
if (isMobile()) {
        Array.from(document.getElementsByClassName("button")).forEach(element => {
                element.classList.remove("buttonSize");
                element.classList.add("buttonSizeMobile");
        });
        playButtonMarginRight = "72px"
}

// Play sound create splats and move the div within the buttons to the top
function PlayTheSoundAndSetDivToTop() {
        document.getElementsByClassName("centerPlayButtonDiv")[0].style.bottom = "0";
        document.getElementsByClassName("centerPlayButtonDiv")[0].style.right = "0";
        document.getElementsByClassName("centerPlayButtonDiv")[0].style.marginRight = playButtonMarginRight;
        document.getElementsByClassName("stopPauseDiv")[0].style.opacity = "1";
        me.volume = 1.0;
        me.play();
        multipleSplats(6);

        var elem = document.body; // Make the body go full screen.
        EnterFullscreen(elem);
}

function StopTheSound() {
        me.currentTime = 0;
        me.pause();
}

function PauseTheSound() {
        me.pause();
}

// Case discrimination for fullscreen.
function EnterFullscreen(element) {
        if (element.requestFullscreen) {
                element.requestFullscreen();
        } else if (element.msRequestFullscreen) {      // for IE11 (remove June 15, 2022)
                element.msRequestFullscreen();
        } else if (element.webkitRequestFullscreen) {  // iOS Safari
                element.webkitRequestFullscreen();
        }
}

// Exit fullscreen
function ExitFullscreen() {
        if (document.exitFullscreen) {
                document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
        }
}

function ShowHideInfo() {
    if (infoIsVisible) {
        document.getElementById('infoButton').innerText = "show info";
        document.getElementById("infoBox").style.opacity = "0";
        infoIsVisible = false;
    }
    else {
        document.getElementById('infoButton').innerText = "hide info";
        document.getElementById("infoBox").style.opacity = "1";
        infoIsVisible = true;
    }
}