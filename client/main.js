$(document).ready(function() {
    let sound = document.getElementById("player");
    sound.currentTime = 0;
    sound.loop = true; //if you want it to restart playing automatically when it ends
    sound.play();
});