//DEPS: GIFEncoder.
var express = require('express');

var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
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

    socket.on("newPot",function(data){
        workingPot = data;
        console.log("Request QR code of pot #" + data);
        socket.broadcast.emit("newPotPython", data);
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
       socket.broadcast.emit("QRReading_frontend", {'pk':plant_PK,
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
    var plantGIF = []; // TODO.

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
            "SELECT time,plant_id,value FROM humidity where plant_id=" + element.plant_id+";",
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
            "SELECT height FROM imatge where plant_id=" + element.plant_id+";",
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
            "SELECT colour FROM imatge where plant_id=" + element.plant_id+";",
            (error, results, fields) => {
            if(error !== null){
                console.log("Error in query!");
                console.log(error);
            }else{
                console.log("\tColor Query done.")
                plantColor.push({"pk":element.plant_id,"colorValues":results.rows});
            }
        });
    });

    while(plantAge.length !== plants.length 
          || plantHumidity.length !== plants.length 
          || plantGrow.length !== plants.length 
          || plantColor.length !== plants.length
        ){
        await sleep(100);
    }
    
    plants.forEach(element => {
        plantAge.forEach(element2 =>{
            if(element2.pk == element.plant_id){
                element.age = element2.age;
            }
        });
        
        plantHumidity.forEach(element3 =>{
            if(element3.pk == element.plant_id){
                element.humidityValues = element3.humidityValues;
            }
        });
        
        plantGrow.forEach(element4 =>{
            if(element4.pk == element.plant_id){
                element.growValues = element4.growValues;
            }
        });
        
        plantColor.forEach(element5 =>{
            if(element5.pk == element.plant_id){
                element.colorValues = element5.colorValues;
            }
        });
    });
    
    console.log(plants);
   // createGIF(plants,socket);
};


const GIFEncoder = require('gifencoder');
const { createCanvas, Image } = require('canvas');
const fs = require('fs');

//Nota: Suposant que imatge es base64 i PNG
var createGIF = async function(plants,socket){
    console.log("Getting images from DB.");
    var images = [];
    
    plants.forEach(element => {
        //Get images values
        client.query(
            "SELECT image FROM imatge where plant_id=" +  element.plant_id + ";",
            (error, results, fields) => {
            if(error !== null){
                console.log("Error in query!");
                console.log(error);
            }else{
                ///console.log(results.rows);
                (results.rows).forEach(element2,index =>{
                    var image = new Image();
                    image.onload = function() {
                        images.push({"pk":element.plant_id,"image":image});
                        console.log("From pk " + element.plant_id + "Image" + index + " added.");
                    };
                    image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='
                    //TODO EDIT THIS!
                    //image.src = 'data:image/png;base64,' + element2;
                });
            }
        });       
    });
    var helper = -1;
    //TODO: THINK THIS HARDER
    //Ara si pasa 1 seg sense rebre images, tira cap a la creacio del gif.
    while(images.length !== helper){
      helper = images.length;
      await sleep(1000);
    }
  
    //Now lets actually create the gif.    
    const encoder = new GIFEncoder(320, 240);
    // stream the results as they are available into myanimated.gif
    encoder.createReadStream().pipe(fs.createWriteStream('myanimated.gif'));

    encoder.start();
    encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
    encoder.setDelay(1000);  // frame delay in ms
    encoder.setQuality(10); // image quality. 10 is default.
 
    // use node-canvas
    const canvas = createCanvas(320, 240);
    const ctx = canvas.getContext('2d');
    
    images.forEach(element =>{
        ctx.drawImage(element.image, 0, 0);
        encoder.addFrame(ctx);
    });
    
    encoder.finish();
    console.log("GIF CREATED");

    //Lets get the gif created and send it to the front-end.
    //TODO: HEADER MUST BE "getCurrentPlants_RESPONSE"
    //socket.emit('image', { image: true, buffer: buf.toString('base64') });

};


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

