
//DEPS: GIFEncoder.

//Connect SSH:
//ssh wee@188.166.9.142
//Password: weeplant1234

var express = require('express');

var app = express();
var serv = require('http').Server(app);

var web_args;

var shouldIOpenAPot = false;
//www.weeplant.es:80/?name=deictics_plant&pot_number=404&watering_time=10&moisture_threshold=.2&moisture_period=60&photo_period=500"""

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
    
    var url = require('url');
    var url_parts = url.parse(req.url, true);
    web_args = url_parts.query;
    var len = Object.keys(web_args).length;
    
    
    if(len != 0){
        console.log("ARGS: \n");
        console.log(web_args);
        shouldIOpenAPot = true;
        res.redirect('/');
    }
});

app.use('/client', express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");

//Postgre SQL Connection
var SQL_HOST = '188.166.9.142';
var SQL_USERNAME = 'wee';
var SQL_PASSWORD = 'weeplant1234';


//Note: Using pool improves speed.
const { Client } = require('pg');

const client = new Client({
    user: SQL_USERNAME,
    host: SQL_HOST,
    database: SQL_USERNAME,
    password: SQL_PASSWORD,
    port: 5432,
});

//Connect to PostgreSQL.
client.connect();

//SocketIO connection. https://www.npmjs.com/package/websocket
var io = require('socket.io')(serv, {});

var workingPot = 0;

io.sockets.on('connection', function(socket) {
    
    socket.on("shouldIOpenAPot",function(data){
        if(shouldIOpenAPot === true){
            
            client.query("SELECT pot_number FROM plant WHERE name=\'" + web_args.name + "\'",
            (error, results, fields) => {
                socket.emit('shouldIOpenAPot_RESPONSE',{
                    'potNumber':results.rows[0]
                });    
            });
        }
    });

    socket.on("newPot",function(data){
        workingPot = data;
        console.log("Request QR code of pot #" + data);
        socket.broadcast.emit("[ADD_PLANT]", data);
    });
    
    socket.on("newPot_CANCELL",function(data){
        workingPot = -1;
        console.log("Request QR code of pot is cancelled!");
        socket.broadcast.emit("[ABORT_PLANT]", data);
    });
    
    socket.on("QRReading",function(plant_PK){
        //Plant PK contains the PK
        console.log("Python QR response. Got the plant PK.");
        
        /*
        var plant_packet = {
            Name:"ERROR",
            Age:-1
        };

        //Get Name, calculate Age.
        client.query(
            "SELECT DATE_PART('day', timezone('Europe/Madrid',CURRENT_TIMESTAMP) -"+
            " (SELECT time from plant WHERE plant_id=" + plant_PK + "));",
            (error, results, fields) => {
            if(error !== null){
                console.log("Error in query!");
                console.log(error);
            }
            plant_packet.Age = results.rows[0].date_part;
            //client.end();
        });
       */

       //NOTA: AQUI ESTAVA POSAT UN BROADCAST i lhe modificat!
       socket.emit("QRReading_frontend", {'pk':plant_PK,
                                                    'potNumber':workingPot
                                                    });
    });

    socket.on("getCurrentPlants",function(){
        var plants = [];
        //Request plant pot 1
        client.query("SELECT plant_id, pot_number, name FROM plant WHERE pot_number=1",
        (error, results, fields) => {
            if(error !== null){
                console.log("Error in query pot 1!");
                console.log(error);
            }else{
                plants.push(results.rows[0]);

                //Request plant pot 2
                client.query("SELECT plant_id, pot_number, name FROM plant WHERE pot_number=2",
                (error, results, fields) => {
                    if(error !== null){
                        console.log("Error in query pot 2!");
                        console.log(error);
                    }else{
                        plants.push(results.rows[0]);
                        //Request plant pot 3
                        client.query("SELECT plant_id, pot_number, name FROM plant WHERE pot_number=3",
                        (error, results, fields) => {
                            if(error !== null){
                                console.log("Error in query pot 3!");
                                console.log(error);
                            }else{
                                plants.push(results.rows[0]);
                                continueWithDates(plants,socket);
                            }
                        });
                    }
                });
            }
        });
    });
});

//Part 2 of the callback chain.
var continueWithDates = async function(plants, socket){
    var plantAge = [];
    var plantHumidity = [];
    var plantGrow = [];
    var plantColor = [];
    var plantWatering = [];

    var filtered = plants.filter(function (el) {
        return el != null && el != undefined;
      });

    
    console.log("Filtered is " + filtered);
    console.log("Non filteres is " + plants);
    plants = filtered;
    
    plants.forEach(element => {
    
        console.log("Getting from id" + element.plant_id);
        //Calculate Age.
        client.query(
            "SELECT DATE_PART('day', timezone('Europe/Madrid',CURRENT_TIMESTAMP) -"+
            " (SELECT since from plant WHERE plant_id=" + element.plant_id + "));",
            (error, results, fields) => {
            if(error !== null){
                console.log("Error in query!");
                console.log(error);
            }else{
                console.log("\tAge Query done.")
                plantAge.push({"pk":element.plant_id,"age":results.rows[0].date_part});
            }
        });

        //Get Humidity values
        client.query(
            "SELECT time, value FROM humidity where plant_id=" + element.plant_id+";",
            (error, results, fields) => {
            if(error !== null){
                console.log("Error in query!");
                console.log(error);
            }else{
                console.log("\tHumidity Query done.")
                plantHumidity.push({"pk":element.plant_id,"humidityValues":results.rows});
            }
        });

         //Get Grow values
         client.query(
            "SELECT time,height FROM imatge where plant_id=" + element.plant_id+";",
            (error, results, fields) => {
            if(error !== null){
                console.log("Error in query!");
                console.log(error);
            }else{
                console.log("\tGrow Query done.")
                plantGrow.push({"pk":element.plant_id,"growValues":results.rows});
            }
        });

         //Get Color values
         client.query(
            "SELECT time,colour FROM imatge where plant_id=" + element.plant_id+";",
            (error, results, fields) => {
            if(error !== null){
                console.log("Error in query!");
                console.log(error);
            }else{
                console.log("\tColor Query done.")
                plantColor.push({"pk":element.plant_id,"colourValues":results.rows});
            }
        });

        //Get Watering values
        client.query(
            "SELECT time, water_applied FROM watering where plant_id=" + element.plant_id+";",
            (error, results, fields) => {
            if(error !== null){
                console.log("Error in query!");
                console.log(error);
            }else{
                console.log("\tWatering Query done.");
                plantWatering.push({"pk":element.plant_id,"wateringValues":results.rows});
            }
        });
    });


    while(plantAge.length !== plants.length 
          || plantHumidity.length !== plants.length 
          || plantGrow.length !== plants.length 
          || plantColor.length !== plants.length
          || plantWatering.length !== plants.length
        ){
        await sleep(100);
    }
    
    plants.forEach(element => {
        plantAge.forEach(element1 =>{
            if(element1.pk == element.plant_id){
                element.age = element1.age;
            }
        });
        
        plantHumidity.forEach(element1 =>{
            if(element1.pk == element.plant_id){
                element.humidityValues = element1.humidityValues;
            }
        });
        
        plantGrow.forEach(element1 =>{
            if(element1.pk == element.plant_id){
                element.growValues = element1.growValues;
            }
        });
        
        plantColor.forEach(element1 =>{
            if(element1.pk == element.plant_id){
                element.colourValues = element1.colourValues;
            }
        });
        
        plantWatering.forEach(element1 =>{
            if(element1.pk == element.plant_id){
                element.wateringValues = element1.wateringValues;
            }
        });

    });
    
    createGIF(plants,socket);
};


const GIFEncoder = require('gifencoder');
const { createCanvas, Image } = require('canvas');
const fs = require('fs');


var createGIF = async function(plants,socket){
    console.log("Getting images from DB.");
    
    //Busquem el nombre de fotos total de la db.
    client.query(
        "SELECT count(image) FROM imatge;",
        (error, results, fields) => {
        if(error !== null){
            console.log("Error in query!");
            console.log(error);
        }else{
            
            continueWithGIF(plants, results.rows[0].count, socket);
        }
    });    
   
};

var continueWithGIF = async function(plants, numberOfPhotos, socket){
    var gifImages = [];
    var countImages = 0;
    
     plants.forEach(element => {
        //Get images values
        client.query(
            "SELECT image FROM imatge where plant_id=" +  element.plant_id + ";",
            (error, results, fields) => {
            if(error !== null){
                console.log("Error in query!");
                console.log(error);
            }else{
                
                (results.rows).forEach(element2 =>{
                    
                    var image = new Image();
                    image.onload = function() {
                        countImages++;
                        if(gifImages[element.plant_id] == undefined){
                            gifImages[element.plant_id] = [image];  
                        }else{
                            gifImages[element.plant_id].push(image);
                        }
                    };
                    image.src = 'data:image/jpg;base64,' + element2.image;
                }); 
            }
        });       
    });

    
    while(numberOfPhotos !=  countImages){
      await sleep(100);
    }

    var stream =  [];
    var fileSaved = 0;
    gifImages.forEach(function(element,index){

        //Now lets actually create the gif.    
        const encoder = new GIFEncoder(320, 240);
        
        // stream the results as they are available into myanimated.gif
        stream[index] = encoder.createReadStream().pipe(fs.createWriteStream('./gifs/myanimated' + index + '.gif'));

        stream[index].on('finish', () => {
            fileSaved++;
        });

        encoder.start();
        encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
        encoder.setDelay(300);  // frame delay in ms
        encoder.setQuality(10); // image quality. 10 is default.
    
        // use node-canvas
        const canvas = createCanvas(320, 240);
        const ctx = canvas.getContext('2d');
        
        element.forEach(element2 =>{
            ctx.drawImage(element2, 0, 0, 320, 240);
            encoder.addFrame(ctx);
        });
        
        encoder.finish();

        console.log("GIF CREATED");
    });

    
    while(fileSaved != plants.length){ //3
        await sleep(100);
    }

    var index = 0;
    
    plants.forEach(element =>{
        index++;
        element.gif = 'data:image/gif;base64,' + fs.readFileSync('./gifs/myanimated' + (index) + '.gif',{encoding:"BASE64"});
    });
    
    //Lets get the gif created and send it to the front-end.
    socket.emit('getCurrentPlants_RESPONSE', plants);
};


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}