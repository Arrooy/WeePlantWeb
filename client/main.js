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

    configIcon();
    configPots();
    configModal();
    drawGraph();
    
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
var modalClosed = function(modal, trigger){
    //Elimina el onclick de la tassa.
    $("#modal__moveRobot").unbind();
}

var modalOpened = function(modal, trigger){
    
}

var configModal = function(){
    
    MicroModal.init();
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
            
            if(item.attr('is_full')){
                
                $("#modal__moveRobot").on('click',function(){
                    socket.emit("moveRobot", index);
                });

                MicroModal.show('modal-1',{
                    onShow: modalOpened,
                    onClose: modalClosed
                });

            }else{
                changeData(index - 1);

                $("#mainMenu").css("display", "none");
                $("#plantMenu").css("display", "inline-block");
            }
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
    drawGraph();
}

var drawGraph = function(){
    var ctx = document.getElementById('graphCavas').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio:false,
            tooltips: {
                mode: 'nearest',
                intersect: 'false'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}
