#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var config = require('./config.dev')
var currentLevel = 0

async function setupServer(queue, handler){
  // amqp.connect('amqp://localhost', function(err, conn) {
  amqp.connect(config.RABBITMQ_URL, function(err, conn) {  
    conn.createChannel(function(err, ch) {
      ch.assertQueue(queue, {durable: false});
      ch.prefetch(1);
      console.log(' [x] Awaiting RPC requests');
      ch.consume(queue, function reply(req) {
        handler(req).then(function(fResult){
          console.log("handle complete, send result to client", fResult);
        ch.sendToQueue(req.properties.replyTo,new Buffer( JSON.stringify( fResult) ), {correlationId: req.properties.correlationId});//sync send the result back to client
        ch.ack(req);
        });
      });
    });
  });
}

//do work
async function worker(req){
  var msg = req.content.toString();
  console.log("receive:", msg);
  var userLevel = {}
  var bluebird = require('bluebird')
  await bluebird.delay(2000)
  try{
    userLevel = JSON.parse(msg)
    currentLevel += 1
    userLevel.level = currentLevel
  }
  catch(e)
  {
    console.error('pass error')
    return -1;
  }
  console.log(" [.] user current Level ", currentLevel);
  return userLevel
}

var q = 'rpc_queue'
setupServer(q, worker)
console.log('rpc server started ...')
