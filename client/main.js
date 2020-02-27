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
    configDropdownMenu();
    drawGraph();
    configDropdownHover();  
    configSocketsHandlers();
});

//New status can be healty - diseased - dead
var changePlantStatus = function(newStatus){
    $('#plantStatus').removeClass("plant-healty");
    $('#plantStatus').removeClass("plant-diseased");
    $('#plantStatus').removeClass("plant-death");

    if(newStatus === "healty"){
        $('#plantStatus').text("Healty");
        $('#plantStatus').addClass("plant-healty");    
    }else if(newStatus === "diseased"){
        $('#plantStatus').text("Diseased");
        $('#plantStatus').addClass("plant-diseased");    
    }else{
        $('#plantStatus').text("Dead");
        $('#plantStatus').addClass("plant-death");    
    }
}

var configDropdownMenu = function(){
    var a = $("#dropdown_options *");
    for(var i = 0; i < a.length; i++){ 
        $("#" + a[i].id).click({item:a,index:i}, dropdownClick);
    }
};

var dropdownClick = function(event){
    $('#dropdown_name').text(event.data.item[event.data.index].text);
    $(".dropdown-content").css("visibility","hidden");
    var selection = event.data.item[event.data.index];
    
    switch(selection.text){
        case "Humidity":
            console.log("Humidity!");
            break;
        case "Grow":
            console.log("Grow!");
            break;
        case "Watering":
            console.log("Watering!");
            break;
        case "Color":
            console.log("Color!");
            break;
        default:       
    }
};

var configDropdownHover = function(){
    $(".dropdown").hover( function(){
        //Handler hover in
        $(".dropdown-content").css("visibility","visible");
    }, function(){
        //Handler hover out
        $(".dropdown-content").css("visibility","hidden");
    });
};

var configIcon = function() {
    
    $("#icon").on('click', function() {
        $("#mainMenu").css("visibility", "visible");
        $("#plantMenu").css("visibility", "hidden");
    });

    $("#icon").hover(function() {
        $(this).css("opacity", "0.75");
    }, function() {
        $(this).css("opacity", "1");
    });
    
};

var modalClosed = function(modal, trigger){
    console.log("MODAL CLOSED");
};

var modalOpened = function(modal, trigger){
    
};

var configSocketsHandlers = function(){
    socket.on("QRReading_frontend",function(pkdict){
        //Plant PK contains the PK
        console.log("PK obtained is " + pkdict.pk);
        $('#pot' + pkdict.potNumber).attr('src','/client/Assets/potF'+pkdict.potNumber+'.svg');
    });
};

var configModal = function(){
    
    MicroModal.init();
};

var configPots = function() {

    for (var index = 1; index <= 3; index++) {
        var item = $("#pot" + index);
        item.hover(function() {
            $(this).css("opacity", "0.75");
        }, function() {
            $(this).css("opacity", "1");
        });
        

        item.on('click', function() {
            
            if($(this).attr('is_full') === "false"){
                
                socket.emit("newPot", $(this).attr('number'));            
                
                MicroModal.show('modal-1',{
                    onShow: modalOpened,
                    onClose: modalClosed
                });

            }else{
                changeData($(this).attr('number') - 1);

                $("#mainMenu").css("visibility", "hidden");
                $("#plantMenu").css("visibility", "visible");
            }
        });
    }
};

//Retorna una tupla amb les dades i els instants de temps de cada dada.
var getGraphData = function(index) {
    return [time[index], data[index]];
};

var getName = function(index) {
    return plantNames[index];
};

var getAge = function(index) {
    return plantAges[index];
};

var changeData = function(index) {
    var data, time, name, age;

    //Get all the data.
    [time, data] = getGraphData(index);
    name = getName(index);
    age = getAge(index);
    console.log(name + "" + age);

    //Update the view with the new data.
    $("#plantName").text(name);
    $("#plantAge").text("Plant age: " + age + " days");
    drawGraph();
};

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
};
