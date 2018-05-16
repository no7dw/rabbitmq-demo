#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var config = require('./config.dev')
var currentLevel = 0
var bluebird = require('bluebird')

function notify(ch, req){
  //pub result
  var ex = JSON.parse(req.content).ex;
  var pubResult = {'correlationId:':req.properties.correlationId, code:0, result:'pass' }
  ch.assertExchange(ex, 'fanout', {durable: false});
  ch.publish(ex,'', new Buffer(JSON.stringify(pubResult)))
  console.log("pub [x] Sent %s: %s", ex, JSON.stringify(pubResult));
}

async function setupServer(queue, handler){
  amqp.connect(config.RABBITMQ_URL, function(err, conn) {  
    conn.createChannel(function(err, ch) {
      ch.assertQueue(queue, {durable: false});
      ch.prefetch(3);      
      console.log(' [x] Awaiting RPC requests');
      ch.consume(queue, function(req) {
        handler(req)
        .then(fResult =>{
          notify(ch, req);
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
  console.log('simulate working in 1s ...')
  await bluebird.delay(1000)
  try {
    userLevel = JSON.parse(msg)
    currentLevel += 1
    userLevel.level = currentLevel
  } catch(e){
    console.error('pass error')
    return -1;
  }
  console.log(" [.] user current Level ", currentLevel);
  return userLevel
}

var q = 'rpc_queue'
setupServer(q, worker)
console.log('rpc server started ...')
