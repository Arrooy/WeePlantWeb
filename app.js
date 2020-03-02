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
        
        //Calculate Age.
        client.query(
            "SELECT DATE_PART('day', timezone('Europe/Madrid',CURRENT_TIMESTAMP) -"+
            " (SELECT since from plant WHERE plant_id=" + element.plant_id + "));",
            (error, results, fields) => {
            if(error !== null){
                console.log("Error in query!");
                console.log(error);
            }else{
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
    createGIF(plants);
    
};


const GIFEncoder = require('gifencoder');
const { createCanvas } = require('canvas');
const fs = require('fs');



/*
fs.readFile(__dirname + '/gifs/plantGIF.gif', function(err, buf){

    socket.emit('image', { image: true, buffer: buf.toString('base64') });
    console.log('image file is initialized');
});
*/

var createGIF = async function(plants){
    console.log("Getting images from DB.");
    var images = [];
/*
    plants.forEach(element => {
        //Get images values
        client.query(
            "SELECT image FROM imatge where plant_id=" +  element.plant_id+";",
            (error, results, fields) => {
            if(error !== null){
                console.log("Error in query!");
                console.log(error);
            }else{
                ///console.log(results.rows);
                (results.rows).forEach(element2 =>{
                    images.push({"pk":element.plant_id,"image":element2});
                });
            }
        });       
    }); */
    
    var base64String = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA'; // Not a real image
    // Remove header
    var base64Image = base64String.split(';base64,').pop();
    console.log(base64Image);
    /*
    while(plants.length !== images.length){
      await sleep(100);
    }*/
    var a = "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";
   
    fs.writeFile("tesssst.jpg", a,{encoding:'base64'} ,(err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });

    //ACTUALLY CREATE THE GIF    
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
    
    var image = new Image();
    image.onload = function() {
        ctx.drawImage(image, 0, 0);
        ctx.drawImage(image, 80, 0);
        encoder.addFrame(ctx);   
        encoder.finish();
    };

    image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAIAAAACDbGyAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9oMCRUiMrIBQVkAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAADElEQVQI12NgoC4AAABQAAEiE+h1AAAAAElFTkSuQmCC";
};


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

