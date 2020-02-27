
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
        console.log("Python QR response. Got the plant PK.\nLooking in db for data.");
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
        
        socket.emit("getCurrentPlants_RESPONSE",
        {

        });
    });
});


//Preguntar al saula com fer l'id.
var addPlant = function(name,watering_time,moisture_threshold,photo_period){
    client.query("INSERT INTO plant (plant_id, name, watering_time, moisture_threshold, photo_period, time)"+
    " VALUES (1, '"+name+"', "+watering_time+", "+moisture_threshold+", "+photo_period+", NOW());",
    (error, results, fields) => {
        console.log(error);
        console.log(results);
        console.log(fields);
    });
};