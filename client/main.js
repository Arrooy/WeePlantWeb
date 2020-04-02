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

//Boolean per indicar si lusuari ha tencat el modal intencionadament o no. Si equival a true, s'ha tencat automaticament.
var plantAdditionSuccessful;

var plantRequestNumber;

$(document).ready(function() {

    plantRequestNumber = 0;
    
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
    socket.emit("getCurrentPlants","");
    socket.emit("shouldIOpenAPot");
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
    console.log("Requesting: "+  selection.text);

    if(selection.text == "Colour"){
        $('.informationPanel').css("visibility","hidden");
    }else{
        $('.informationPanel').css("visibility","visible");
    }

    drawGraph(dataset);
};

var modalClosed = function(modal, trigger){
    
    if(plantAdditionSuccessful){
        console.log("Modal closed. New plant added ok.");
    }else{
        console.log("Modal closed due to user intervention.");
        //socket.emit("CANCELL", ""); 
    }

    plantAdditionSuccessful = false;
};

var modalOpened = function(modal, trigger){
    
};

var configSocketsHandlers = function(){
    socket.on("QRReading_frontend", function(pkdict){
        //Plant PK contains the PK
        console.log("PK obtained is " + pkdict.pk);
        plantAdditionSuccessful = true;
        $('#pot' + pkdict.potNumber).attr('src','/client/Assets/potF'+pkdict.potNumber+'.svg');
        MicroModal.close('modal-1'); 

        plantRequestNumber = pkdict.potNumber;
        socket.emit("getCurrentPlants","");  

        $("#mainMenu").css("visibility", "hidden");
        $("#plantMenu").css("visibility", "visible");
    });

    socket.on("shouldIOpenAPot_RESPONSE",function(data){
        console.log("Someone scanned pot number " + data);
        plantsData.forEach(element=>{
            if(element.pot_number === data.potNumber){
                //TOODO:
                console.log("THE ELEMENT SCANNED WITH PHONE IS LOADED. WE CAN DISPLAY IT.");
            }
        });
    });
   
    //El backend respon amb les dades de les plantes.
    socket.on("getCurrentPlants_RESPONSE",function(data){
        
        plantsData = data;
        
        db_loaded = true;
        MicroModal.close('modal-2');

        console.log("Got updated data from the backend!");
        console.log(data);

        data.forEach(function(item, index){
            $('#pot' + item.pot_number).attr('is_full',true);
            $('#pot' + item.pot_number).attr('src','/client/Assets/potF' + item.pot_number + '.svg');
        });
        
        if(plantRequestNumber != 0){
            changeData(plantRequestNumber - 1);
        }
        
        plantRequestNumber = 0;
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
            
            if($(this).attr('is_full') === "false"){
                //Espera la resposta del backend QRReading_frontend
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


var changeData = function(index) {
    
    if(index >= plantsData.length)
        return;

    //Update the view with the new data.
    $("#plantName").text(plantsData[index].name);
    $("#plantAge").text("Plant age: " + plantsData[index].age + " days");
    $("#gif").attr('src',plantsData[index].gif);


    var humidity_data_aux = plantsData[index].humidityValues;
    var grow_data_aux  = plantsData[index].growValues;
    
    colour_data = plantsData[index].colourValues[plantsData[index].colourValues.length - 1];
    var watering_data_aux = plantsData[index].wateringValues;
    
    //Clear array.
    humidity_data = [];
    //Add data with new format
    humidity_data_aux.forEach(function(element,index){
        if(index != 0){
            var d = new Date(element.time);
            humidity_data.push({x:d.getSeconds() + d.getMinutes() * 60,y:element.value});
        }
    });
    
    //Clear array.
    grow_data = [];
    //Add data with new format
    grow_data_aux.forEach(function(element,index){
        if(index != 0){
            var d = new Date(element.time);
            grow_data.push({x:d.getSeconds() + d.getMinutes() * 60, y:element.height});
        }
    });

    //Clear array.
    watering_data = [];
    //Add data with new format
    watering_data_aux.forEach(function(element,index){
        if(index != 0){
            var d = new Date(element.time);
            watering_data.push({x:d.getSeconds() + d.getMinutes() * 60, y:element.water_applied});
        }
    });

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
            console.log("Humidity!");
            _label = 'Relative humidity';
            
            _data = humidity_data;
            break;
        case "Grow":
            console.log("Grow!");
            _label = 'Plant height';

            _data = grow_data;
            break;
        case "Watering":
            console.log("Watering!");
            _label = 'Amount of water';
            _data = watering_data;
            break;
        case "Colour":
            console.log("Color!");
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
                            labelString: 'Temps'
                        }
                    }],
                    scales: {
                        yAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: _data_.datasets[0].label
                            }
                        }],
                    }
                }
                
            }
        });
    }else{
        //Chart needs an update:
        myChart.data = _data_;
        myChart.options.scales.yAxes[0].scaleLabel.labelString = _data_.datasets[0].label;
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