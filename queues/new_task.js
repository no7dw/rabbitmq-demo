#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'task_queue';
    var msg = process.argv.slice(2).join(' ') || "Hello World!";

    ch.assertQueue(q, {durable: true});//msg won't lost event if rabbitMQ restarts
    ch.sendToQueue(q, new Buffer(msg), {persistent: true});//msg won't lost event if rabbitMQ restarts
    console.log(" [x] Sent '%s'", msg);
  });
  setTimeout(function() { conn.close(); process.exit(0) }, 10); //don't set timeout time 0 -- you know why... exit before send msg to rabbitmq
});
