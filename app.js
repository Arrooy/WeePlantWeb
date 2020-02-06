var SQL_HOST = '188.166.9.142'
var SQL_USERNAME = 'wee'
var SQL_PASSWORD = 'weeplant1234'

var express = require('express');

var app = express();
var serv = require('http').Server(app);
var WebSocketServer = require('websocket').server;
var io = require('socket.io')(serv, {});



app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");


const { Client } = require('pg')

const client = new Client({
    user: SQL_USERNAME,
    host: SQL_HOST,
    database: SQL_USERNAME,
    password: SQL_PASSWORD,
    port: 5432,
})

client.connect()

client.query('SELECT NOW()', (err, res) => {
    console.log(err, res)
    client.end()
})

io.sockets.on('connection', function(socket) {
    socket.on("newPot", function(data) {
        console.log("Request QR code of pot #" + data);
    })
});

wsServer = new WebSocketServer({
    httpServer: serv,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var connection = request.accept('echo-protocol', request.origin);

    console.log((new Date()) + ' Connection accepted.');

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        } else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });

    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});