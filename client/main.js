$(document).ready(function() {
    $("#pot1").on('click', function() {
        console.log("HEY");
    });
    $("#icon").on('click', function() {
        $("#mainMenu").css("display", "block");
        $("#plantMenu").css("display", "none");
    });
    $("#plantMenu").css("display", "none");
    $("#mainMenu").css("display", "block");
    addHovers();
});

var addHovers = function() {
    $("#icon").hover(function() {
        $(this).css("opacity", "0.75");
    }, function() {
        $(this).css("opacity", "1");
    });
    for (let index = 1; index <= 3; index++) {
        let item = $("#pot" + index);
        item.hover(function() {
            $(this).css("opacity", "0.75");
        }, function() {
            $(this).css("opacity", "1");
        });
        item.on('click', function() {
            $("#mainMenu").css("display", "none");
            $("#plantMenu").css("display", "inline-block");
        });
    }
}