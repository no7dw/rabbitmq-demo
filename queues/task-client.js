#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var config = require('../rpc/config.dev');
console.log(config.RABBITMQ_URL)
amqp.connect(config.RABBITMQ_URL, function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'task_queue';
    var msg = process.argv.slice(2).join(' ') || "Hello World!";

    ch.assertQueue(q, {durable: true});//msg won't lost event if rabbitMQ restarts
    ch.sendToQueue(q, new Buffer(msg), {persistent: true});//msg won't lost event if rabbitMQ restarts
    //try send twice
    ch.sendToQueue(q, new Buffer(msg), {persistent: true});
    console.log(" [x] Sent '%s'", msg);
  });
  setTimeout(function() { conn.close(); process.exit(0) }, 5000); //don't set timeout time 0 -- you know why... exit before send msg to rabbitmq
});
