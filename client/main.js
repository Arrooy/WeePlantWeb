var socket = io();

//All the data about the plants.
var plantsData;

//Graph data from plantsData.
var humidity_data = [];
var grow_data = [];
var colour_data = [];
var watering_data = [];

var db_loaded;

var myChart;

var cheatXAxisName;

//Boolean per indicar si lusuari ha tencat el modal intencionadament o no. Si equival a true, s'ha tencat automaticament.
var plantAdditionSuccessful;
var requestedAdditionModal3;
var working_pot;

var plant_name_modal_3 = "";

var firstPageLoad;

$(document).ready(function() {
    firstPageLoad = true;
    requestedAdditionModal3 = false;
    working_pot = 0;


    configIcon();
    configPots();
    configModal();
    configDropdown();  
    configDropdownMenu();
    configSocketsHandlers();
    
    addCurrentPlants();
    
});

//Demanem al backend les plantes que hi han.
var addCurrentPlants = function(){
    //El backend contestara amb getCurrentPlants_RESPONSE
    console.log("Requesting get current plants in main one tme!")
    socket.emit("getCurrentPlants","");
    firstPageLoad = true;
};

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
    
    //S'actualitza les dades de la grafica amb les dades obtingudes amb getCurrentPlants_RESPONSE.
    var dataset = getData(selection.text);
    if(dataset === "HELP!"){
        console.log("No color data: ");
        dataset = {
            labels: [],
            datasets: [
                //RED
            {
                label: "Red",
                data: [],
                backgroundColor: [
                    '#CD2626CC'
                ],
                borderColor: [
                    '#CD2626'
                ],
                borderWidth:1
            },
            //GREEN
            {
                label: "Green",
                data: [],
                backgroundColor: [
                    '#4DBD33CC'
                ],
                borderColor: [
                    '#4DBD33'
                ],
                borderWidth:1
            },
            //BLUE
            {
                label: "Blue",
                data: [],
                backgroundColor: [
                    '#63D1F4CC'
                ],
                borderColor: [
                    '#63D1F4'
                ],
                borderWidth:1
            }]
        };

    }
    console.log("Requesting: "+  selection.text);

    if(selection.text == "Colour histogram"){
        $('.informationPanel').css("visibility","hidden");
        $('.arrow-down').css("right","41%");
    }else{
        $('.arrow-down').css("right","43%");
        $('.informationPanel').css("visibility","visible");
    }    
    drawGraph(dataset);
};

var modalClosed = function(modal, trigger){
    
    if(plantAdditionSuccessful){
        console.log("Modal closed. New plant added ok.");
    }else{
        console.log("Modal closed due to user intervention.");
        socket.emit("newPot_CANCELL", ""); 
    }
    plant_name_modal_3 = "";

    plantAdditionSuccessful = false;
};

var modalOpened = function(modal, trigger){
};

var getNextPotAvailable = function(){
    for (var index = 1; index <= 3; index++) {
        if($("#pot" + index).attr('is_full') === "true"){
            console.log("Pot " + index + " is full, trying with next");
        }else{
            return index;
        }
    }
    return -1;
}

var modal3Opened = function(modal,trigger){
    console.log("Modal 3 opened");
    
    
    $("#modal_3_1_to_change").text(plant_name_modal_3);

    $("#modal_3_to_change").text(plant_name_modal_3);

    $("#modal_add_plant").on('click', function() {
        
        var pot_number = getNextPotAvailable();

        plantAdditionSuccessful = false;
        requestedAdditionModal3 = true;
        console.log("Adding new plant with dialog 3 help.");
        socket.emit("newPot_WEB_KNOWS_QR", pot_number);            
        
        /*
        MicroModal.close('modal-3');


        MicroModal.show('modal-1',{
            onShow: modalOpened,
            onClose: modalClosed
        });
        */
        working_pot = pot_number;
        
    });
}

var modal3Closed = function(modal,trigger){
    console.log("Modal 3 closed");
};

var configSocketsHandlers = function(){
    
    //http://localhost:2000/?name=Coolantus
    socket.on("shouldIOpenAPot_RESPONSE",function(data){
        var found = false;
        
        console.log(data)
        if(data == "0") return;

        if (data.plantName == undefined){
            var pot_number = data.potNumber['pot_number'];
        
            console.log("Someone scanned pot number " + pot_number);
            
            plantsData.forEach(element=>{
                if(element.pot_number == pot_number){
                    found = true;
                    working_pot = pot_number;
                    changeData(pot_number);
                    $("#mainMenu").css("visibility", "hidden");
                    $("#plantMenu").css("visibility", "visible");
                }
            });
        }else{
            plant_name_modal_3 = data.plantName;
        }

        if(found == false){

            if(getNextPotAvailable() == -1){
                console.log("THERE ARE NO POTS AVAILABLE!");
            }else{
                MicroModal.close('modal-3');
                MicroModal.show('modal-3',{
                    onShow: modal3Opened,
                    onClose: modal3Closed
                });

            }
        }
    });
    
    socket.on("REFRESH_frontent", function(pot_number){
        if(pot_number == working_pot){
            console.log("REFRESH requested. Updating data of current pot");
            socket.emit("getCurrentPlants","");  
        }else{
            console.log("REFRESH requested. Skipping update.");
        }
        console.log("pot_number is " + pot_number + " working_pot is " + working_pot);
    });

   
    //El backend respon amb les dades de les plantes.
    socket.on("getCurrentPlants_RESPONSE",function(data){
        console.log("Got updated data from the backend!");
        console.log(data);

        plantsData = data;
        
        if(requestedAdditionModal3){
            console.log("We should close modal 3 now!")
            MicroModal.close('modal-3');
        }else{
            socket.emit("shouldIOpenAPot");
        }
        plantAdditionSuccessful = true;

        if(firstPageLoad){
            MicroModal.close('modal-2');
            db_loaded = true;
            firstPageLoad = false;
        }else{
            console.log("Our working pot is " + working_pot);
            changeData(working_pot);
            
            MicroModal.close('modal-1');
            $("#mainMenu").css("visibility", "hidden");
            $("#plantMenu").css("visibility", "visible");
        }

        data.forEach(function(item, index){
            console.log("\t\tSetting  #pot" + item.pot_number + " to true");
            $('#pot' + item.pot_number).attr('is_full',true);
            $('#pot' + item.pot_number).attr('src','/client/Assets/potF' + item.pot_number + '.svg');
        });
    });
};

var configModal = function(){
    db_loaded = false;
    MicroModal.init();
    MicroModal.show('modal-2');
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
            working_pot = $(this).attr('number');

            if($(this).attr('is_full') === "false"){
                plantAdditionSuccessful = false;
                console.log("Nothing in the pot. Adding new plant.");
                //Espera la resposta del backend QRReading_frontend
                socket.emit("newPot", $(this).attr('number'));            
                
                MicroModal.show('modal-1',{
                    onShow: modalOpened,
                    onClose: modalClosed
                });

            }else{
                changeData($(this).attr('number'));

                $("#mainMenu").css("visibility", "hidden");
                $("#plantMenu").css("visibility", "visible");
            }
        });
    }
};


var changeData = function(index) {
    
    var i = 0;
    var plantDataAux;

    
    plantsData.forEach(e => {
        if(e.pot_number  == index){
            console.log("Setting data to pot index" + i);
            plantDataAux = plantsData[i];
        }
        i++;
    });
    
    //Update the view with the new data.
    $("#plantName").text(plantDataAux.name);
    $("#plantAge").text("Plant age: " + plantDataAux.age + " days");
    
    if(plantDataAux.gif == undefined){
        $("#gif").attr('src',"https://e-fisiomedic.com/wp-content/uploads/2013/11/default-placeholder-300x300.png");
    }else{
        $("#gif").attr('src',plantDataAux.gif);
    }

    var humidity_data_aux = plantDataAux.humidityValues;
    var grow_data_aux  = plantDataAux.growValues;
    
    colour_data = plantDataAux.colourValues[plantDataAux.colourValues.length - 1].colour;
    var watering_data_aux = plantDataAux.wateringValues;
    
    //Clear array.
    humidity_data = [];
    //Add data with new format
    humidity_data_aux.forEach(function(element,index){
        var d = new Date(element.time);
        humidity_data.push({x:d.getSeconds() + d.getMinutes() * 60,y:element.value});
    });
    
    //Clear array.
    grow_data = [];
    //Add data with new format
    grow_data_aux.forEach(function(element,index){
  
        var d = new Date(element.time);
        grow_data.push({x:d.getSeconds() + d.getMinutes() * 60, y:element.height});
    });

    //Clear array.
    watering_data = [];
    //Add data with new format
    watering_data_aux.forEach(function(element,index){
        var d = new Date(element.time);
        watering_data.push({x:d.getSeconds() + d.getMinutes() * 60, y:element.water_applied});
    });

    $("#dropdown_name").text("Humidity");
    var data = getData("Humidity");
    drawGraph(data);
};

var getData = function(dataType){
    var _label = "Error";
    var _labels = [];
    var _data = [{x:0,y:10},
                {x:1,y:1}];

    switch(dataType){
        case "Humidity":
            _label = 'Relative humidity';
            cheatXAxisName = "Time";        
            cheatYAxisName = "%";        
            _data = humidity_data;
            break;
        case "Grow":
            console.log("Grow!");
            _label = 'Plant height';
            cheatXAxisName = "Time";
            cheatYAxisName = "cm";
            _data = grow_data;
            break;
        case "Watering":
            console.log("Watering!");
            _label = 'Amount of water';
            cheatXAxisName = "Time";
            cheatYAxisName = "cl";
            _data = watering_data;
            break;
        case "Colour histogram":
            console.log("Color !");
            cheatXAxisName = "";
            cheatYAxisName = "";
            if(colour_data == undefined) return "HELP!" 
            return createColorGraph();
        default:       
    }
    
    var values = [];
    
    _data.forEach(element=>{
        _labels.push("");
        values.push(element.y);        
    });

    const arrMax = Math.max(...values);
    const arrMin = Math.min(...values);
    const arrAvg = values.reduce((a,b) => a + b, 0) / values.length;

    $("#MinimumValue").text("Minimum: " + arrMin);
    $("#MaximumValue").text("Maximum: " + arrMax);
    $("#AverageValue").text("Average: " + arrAvg);
    
    var maxGradient = 0;
    var minGradient = Infinity;
    
    for(var i = 0; i < _data.length - 1; i ++){
        var grad;
        grad = (_data[i + 1].y - _data[i].y) / (_data[i + 1].x - _data[i].x);
        if(grad > maxGradient) maxGradient = grad;
        else if(grad < minGradient) minGradient = grad;
    }

    $("#MinimumGradientValue").text("Biggest negative slope change: " + minGradient);
    $("#MaximumGradientValue").text("Biggest positive slope change: " + maxGradient);

    //Uau.
    return {
        labels: _labels,
        datasets: [{
            label: _label,
            data: _data,
            backgroundColor: [
                '#0B7A67B0'
            ],
            borderColor: [
                '#0B7A67'
            ],
            borderWidth:1
        }]
    };
};


var createColorGraph = function(){
    
    var _labels = [];

    colour_data.colour[0].forEach(element=>{
        _labels.push("");
    });

    return{
        labels: _labels,
        datasets: [
            //RED
        {
            label: "Red",
            data: colour_data.colour[0],
            backgroundColor: [
                '#CD2626CC'
            ],
            borderColor: [
                '#CD2626'
            ],
            borderWidth:1
        },
        //GREEN
        {
            label: "Green",
            data: colour_data.colour[1],
            backgroundColor: [
                '#4DBD33CC'
            ],
            borderColor: [
                '#4DBD33'
            ],
            borderWidth:1
        },
        //BLUE
        {
            label: "Blue",
            data: colour_data.colour[2],
            backgroundColor: [
                '#63D1F4CC'
            ],
            borderColor: [
                '#63D1F4'
            ],
            borderWidth:1
        }]
    };
};

var drawGraph = function(_data_){
    
    var canvas = document.getElementById('graphCavas');
    var ctx = canvas.getContext('2d');
    
    if(myChart === undefined){
        myChart = new Chart(ctx, {
            type: 'line',
            data: _data_,
            options: {
                maintainAspectRatio:false,
                tooltips: {
                    displayColors: false,
                    mode: 'nearest',
                    intersect: 'false',
                },
                scales:{
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: cheatXAxisName
                        }
                    }],    
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: cheatYAxisName
                        }
                
                    }]
                }
            }
        });
    }else{
        //Chart needs an update:
        myChart.data = _data_;
        myChart.options.scales.yAxes[0].scaleLabel.labelString = cheatYAxisName;
        myChart.options.scales.xAxes[0].scaleLabel.labelString = cheatXAxisName;
        myChart.update();
    }
    
};


//** VISUAL FUNCTIONS **/
var configDropdown = function(){
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
};

$(document).keydown(function (event) {
    if (event.keyCode === 27 && db_loaded === false) {
      event.stopImmediatePropagation();
    }
});