#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

function setup(queue, handler){
  amqp.connect('amqp://localhost', function(err, conn) {
    conn.createChannel(function(err, ch) {
      ch.assertQueue(queue, {durable: false});
      ch.prefetch(1);
      console.log(' [x] Awaiting RPC requests');
      ch.consume(queue, function reply(req) {
        var fResult = handler(req);
        console.log("compute complete");
        ch.sendToQueue(req.properties.replyTo,
          new Buffer(fResult.toString()),
          {correlationId: req.properties.correlationId});//sync send the result back to client
        ch.ack(req);
      });
    });
  });
}

//do work
function worker(req){
  var n = parseInt(req.content.toString());
  console.log(" [.] fib(%d)", n);
  return fibonacci(n);
}

function fibonacci(n) {
  if (n == 0 || n == 1)
    return n;
  else
    return fibonacci(n - 1) + fibonacci(n - 2);
}

var q = 'rpc_queue';
setup(q, worker);
console.log('rpc server started ...');


