#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var config = require('./config.dev')
var currentLevel = 0
var bluebird = require('bluebird')
var Redis = require('ioredis');
var redis = new Redis();
function initRedis(){
  redis.set('rpccount', 0 )
}
function decRediscount(){
  redis.decr('rpccount')
}
function incRediscount(){
  redis.incr('rpccount')
}
async function setupServer(queue, handler){
  initRedis()
  amqp.connect(config.RABBITMQ_URL, function(err, conn) {  
    if(err){
      console.log("err", err);
      return
    }
    conn.createChannel(function(err, ch) {
      ch.assertQueue(queue, {durable: false});
      ch.prefetch(3);
      console.log(' [x] Awaiting RPC requests');
      ch.consume(queue, function(req) {
        incRediscount()
        // console.log("count",count)
        handler(req)
        .then(fResult =>{
          console.log("handle complete, send result to client", fResult);
          ch.sendToQueue(req.properties.replyTo,new Buffer( JSON.stringify( fResult) ), {correlationId: req.properties.correlationId});//sync send the result back to client
          // ch.ack(req);
          var rdn = parseInt(Math.random()*1000*5);
          console.log('delay finish in %d ms' , rdn);
          bluebird.delay(rdn).then(function(){
            decRediscount()
            ch.ack(req);  
            console.log('finish ack');
            ch.get(queue);
            ch.cancel();
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
