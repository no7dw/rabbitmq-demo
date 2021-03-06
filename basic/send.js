#!/usr/bin/env node
var amqServerIp = "localhost";
var amqp = require('amqplib/callback_api');
amqp.connect('amqp://' + amqServerIp  , function(err, conn) {
    if(err){
        console.log(err);
        return -1;
    }
  conn.createChannel(function(err, ch) {
    var q = 'hello';

    ch.assertQueue(q, {durable: false});
    ch.sendToQueue(q, new Buffer('Hello World!'));
    console.log(" [x] Sent 'Hello World!'");
  });
});
