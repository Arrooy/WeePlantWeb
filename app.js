var SQL_HOST = ""
var SQL_USERNAME = ""
var SQL_PASSWORD = ""

var express = require('express');
var mysql = require('mysql');

var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");

/*
var con = mysql.createConnection({
    host: SQL_HOST,
    user: SQL_USERNAME,
    password: SQL_PASSWORD
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

*/
var io = require('socket.io')(serv, {});

io.sockets.on('connection', function(socket) {
    socket.on("newPot", function(data) {
        console.log("Request QR code of pot #" + data);
    })
});