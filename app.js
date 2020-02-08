
var express = require('express');

var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");

//SQL Connection
var SQL_HOST = '188.166.9.142'
var SQL_USERNAME = 'wee'
var SQL_PASSWORD = 'weeplant1234'

const { Client } = require('pg')

const client = new Client({
    user: SQL_USERNAME,
    host: SQL_HOST,
    database: SQL_USERNAME,
    password: SQL_PASSWORD,
    port: 5432,
})

//client.connect()

//SQL test querry.
client.query('SELECT NOW()', (err, res) => {
    console.log(err, res)
    client.end()
})


//SocketIO connection. https://www.npmjs.com/package/websocket
var io = require('socket.io')(serv, {});
let s;

io.sockets.on('connection', function(socket) {
    socket.on("newPot", function(data) {
        console.log("Request QR code of pot #" + data);
        socket.broadcast.emit("resp",);
    });

    socket.on("moveRobot",function(data){
        console.log("Request QR code of pot #" + data);
        socket.broadcast.emit("moveRobot",data);
    });
    
    socket.on("QRReading",function(plant_PK){
       //Plant PK contains the PK

        socket.broadcast.emit("moveRobot",data);
    });
    
    
});

/*
const interval = setInterval(function() {
    // method to be executed;
    s.emit("resp","asd");
    }, 1000);*/