var express = require('express');
var app = express();
//var nodemailer = require('nodemailer');
var serv = require('http').Server(app);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");
/*
var io = require('socket.io')(serv, {});

io.sockets.on('connection', function(socket) {
    
        socket.on("MyIpIs", function(data) {

            var emailEmiter = 'actura@actura12.com';
            var emailEmiterPass = 'Numancia56';

            if (ipList.indexOf(data.ip) === -1) {


                var mailOK = data.mail.indexOf("@") !== -1 && data.mail.indexOf(".") !== -1 && data.mail.length >= 5;
                var allGood = mailOK && data.nom.length !== 0 && data.cog.length !== 0 && data.message.length !== 0;

                if (allGood) {

                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: emailEmiter,
                            pass: emailEmiterPass
                        }
                    });

                    var subject;
                    var text;

                    if (data.idioma === 1) {
                        //Catala
                        subject = "Formulari Actura12";
                        text = "Hem rebut el teu formulari correctament, ens posarem en contacte el mes aviat possible.";
                    } else if (data.idioma === 2) {
                        //Angles
                        subject = "Actura12 Form";
                        text = "We have received your form correctly, we will contact you as soon as possible.";
                    } else {
                        //Castella
                        subject = "Formulario Actura12";
                        text = "Hemos recivido tu formulario correctamente, nos pondremos en contacto lo antes posible.";
                    }

                    var mailOptions = {
                        from: emailEmiter,
                        to: data.mail,
                        subject: subject,
                        html: "<p>" + text + "</p>"
                    };

                    transporter.sendMail(mailOptions, function(error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });

                    var mailOptions2 = {
                        from: emailEmiter,
                        to: emailEmiter,
                        subject: "Formulari de " + data.nom + " " + data.cog,
                        html: "<p>Nom: " + data.nom + " " + data.cog + "</p><p> Email: " + data.mail + "</p>" +
                            "<p> Missatge: " + data.message + "</p>"
                    };

                    transporter.sendMail(mailOptions2, function(error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                }

            } else {
                console.log("IP ALREADY REGISTERED");
            }

            ipList.push(data.ip.ip);
        })
});
*/