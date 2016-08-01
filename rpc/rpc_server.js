#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var currentLevel = 0

// function fibonacci(n) {
//   if (n == 0 || n == 1)
//     return n;
//   else
//     return fibonacci(n - 1) + fibonacci(n - 2);
// }

function setup(queue, handler){
  amqp.connect('amqp://localhost', function(err, conn) {
    conn.createChannel(function(err, ch) {
      ch.assertQueue(queue, {durable: false});
      ch.prefetch(1);
      console.log(' [x] Awaiting RPC requests');
      ch.consume(queue, function reply(req) {
        var fResult = handler(req);
        console.log("handle complete, send result to client", fResult);
        ch.sendToQueue(req.properties.replyTo,
          new Buffer( JSON.stringify( fResult) ),
          {correlationId: req.properties.correlationId});//sync send the result back to client
        ch.ack(req);
      });
    });
  });
}

//do work
function worker(req){
  var msg = req.content.toString();
  console.log("receive:", msg);
  var userLevel = {}
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
setup(q, worker)
console.log('rpc server started ...')
