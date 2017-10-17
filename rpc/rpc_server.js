#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var config = require('./config.dev')
var currentLevel = 0
var bluebird = require('bluebird')

async function setupServer(queue, handler){
  amqp.connect(config.RABBITMQ_URL, function(err, conn) {  
    conn.createChannel(function(err, ch) {
      ch.assertQueue(queue, {durable: false});
      ch.prefetch(1);
      console.log(' [x] Awaiting RPC requests');
      ch.consume(queue, function(req) {
        handler(req)
        .then(fResult =>{
          console.log("handle complete, send result to client", fResult);
          ch.sendToQueue(req.properties.replyTo,new Buffer( JSON.stringify( fResult) ), {correlationId: req.properties.correlationId});//sync send the result back to client
          console.log('delay finish in 5s');
          bluebird.delay(5000).then(function(){
            ch.ack(req);  
            console.log('finish ack');
          });
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
  console.log('simulate working in 2s ...')
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
