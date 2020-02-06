var socket = io();

var time = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
];
var data = [
    [0, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 5, 5],
    [5, 5, 5, 4, 4, 3, 3, 3, 3, 2, 2, 2, 1, 0],
    [0, 1, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
];

var plantNames = ["Tomates", "Rosa", "Margarita"];
var plantAges = [5, 10, 20];

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

            changeData(index - 1);
            $("#mainMenu").css("display", "none");
            $("#plantMenu").css("display", "inline-block");
        });
    }
}


//Retorna una tupla amb les dades i els instants de temps de cada dada.
var getGraphData = function(index) {
    return [time[index], data[index]];
}

var getName = function(index) {
    return plantNames[index];
}

var getAge = function(index) {
    return plantAges[index];
}

var changeData = function(index) {
    let data, time, name, age;

    //Get all the data.
    [time, data] = getGraphData(index);
    name = getName(index);
    age = getAge(index);
    console.log(name + "" + age);

    //Update the view with the new data.
    $("#plantName").text(name);
    $("#plantAge").text("Plant age: " + age + " days");
    drawGraph(data, time);
}
var getMinMax = function getMinMax(arr) {
    let min = arr[0];
    let max = arr[0];
    let i = arr.length;

    while (i--) {
        min = arr[i] < min ? arr[i] : min;
        max = arr[i] > max ? arr[i] : max;
    }
    return [min, max];
}

var drawGraph = function(data, time) {

    let minData, maxData;
    [minData, maxData] = getMinMax(data);
    var c = document.getElementById("graphCavas");
    drawAxis(c, time[0], time[time.length - 1], minData, maxData);
}

//fx,lx,fy,ly son first x, last x... per saber la resolucio de la grafica.
var drawAxis = function(c, fx, lx, fy, ly) {
    var ctx = c.getContext("2d");
    //Escalat de les variables rebudes.
    var width = c.width;
    var height = c.height;

    let maxY = 10;
    let maxX = width - 10;
    let originX = 10;
    let originY = height - 10;

    ctx.fillStyle = '#F0F000';
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(originX, maxY);
    ctx.lineTo(originX, originY);
    ctx.lineTo(maxX, originY);
    ctx.stroke();

}

var line = function(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(100, 200);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#808000';
    ctx.stroke();
}

var draw = function() {
    var c = document.getElementById("graphCavas");
    var width = c.width;
    var height = c.height;
    var ctx = c.getContext("2d");
    ctx.beginPath();
    ctx.arc(50, 50, 40, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = 'blue';
    ctx.fillRect(100, 20, 100, 100);
}