var socket = io();

$(document).ready(function() {

    $("#plantMenu").css("display", "none");
    $("#mainMenu").css("display", "block");
    configIcon();
    configPots();
});

var configIcon = function() {
    $("#icon").on('click', function() {
        $("#mainMenu").css("display", "block");
        $("#plantMenu").css("display", "none");
    });
    $("#icon").hover(function() {
        $(this).css("opacity", "0.75");
    }, function() {
        $(this).css("opacity", "1");
    });
}
var configPots = function() {

    for (let index = 1; index <= 3; index++) {
        let item = $("#pot" + index);
        item.hover(function() {
            $(this).css("opacity", "0.75");
        }, function() {
            $(this).css("opacity", "1");
        });

        item.on('click', function() {
            socket.emit("newPot",
                index
            );
            $("#mainMenu").css("display", "none");
            $("#plantMenu").css("display", "inline-block");
        });
    }
}

var draw = function() {
    var c = document.getElementById("graphCavas");
    var ctx = c.getContext("2d");
    ctx.beginPath();
    ctx.arc(50, 50, 40, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = 'blue';
    ctx.fillRect(100, 20, 100, 100);
}