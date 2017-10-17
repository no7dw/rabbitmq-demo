#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var config = require('./config.dev')
var callCount = 0

var q = 'rpc_queue'
var co = require('co')

var worker = function* (req, ch){
  var result = yield cal(req);
  console.log("handle complete, send result to client", result);
  ch.sendToQueue(req.properties.replyTo,new Buffer( JSON.stringify( result) ), {correlationId: req.properties.correlationId});//sync send the result back to client
  ch.ack(req);
}

function setupServer(queue, handler){
  console.log(handler)
  amqp.connect(config.RABBITMQ_URL, function(err, conn) {  
    conn.createChannel(function(err, ch) {
      ch.assertQueue(queue, {durable: false});
      ch.prefetch(1);
      console.log('rpc server started ...')
      console.log(' [x] Awaiting RPC requests');
      ch.consume(queue, function (req) {
        console.log(req.content.toString())
        handler(req, ch)
      });
    });
  });
}

//do work
var cal = function* (req){
  var msg = req.content.toString();
  console.log("receive:", msg);
  var userLevel = {}
  var bluebird = require('bluebird')
  yield bluebird.delay(1000)
  try{
    userLevel = JSON.parse(msg)
    callCount += 1
    userLevel.level = callCount
  }
  catch(e){
    console.error('pass error' , e)
    return -1;
  }
  console.log(" [.] user current Level ", callCount);
  return userLevel
}

co(function*(){
   setupServer(q, worker);
}, function(err){
  console.error(err)
})
