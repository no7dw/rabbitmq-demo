#!/usr/bin/env node
'use strict'

var amqp = require('amqplib').connect('amqp://user:password@ali3')

var args = process.argv.slice(2)

if (args.length == 0) {
  console.log("Usage: rpc_client.js num");
  process.exit(1)
}

function generateUuid() {
  return Math.random().toString() +
         Math.random().toString() +
         Math.random().toString()
}

function sender( msg , resHandler){
  amqp.then(function(conn){
    return conn.createChannel()
  }).then(function(ch){
    return ch.assertQueue('', {exclusive: true}).then(function(cbQueue){
      var corr = generateUuid()
      console.log(' [x] Requesting fib(%d)', msg)
      ch.consume(cbQueue.queue, function(res){resHandler(res, corr );}, {noAck: true})//async
      ch.sendToQueue('rpc_queue', new Buffer(msg.toString()),{ correlationId: corr, replyTo: cbQueue.queue })
    })
  }).catch(console.warn)
}

function responseHandler(res, corr, conn){
  if (res.properties.correlationId == corr) {
    console.log(' [.] Got %s', res.content.toString());
    setTimeout(function() {  process.exit(0) }, 500);
  }
};

var num = parseInt(args[0])
sender(num.toString(), responseHandler)
