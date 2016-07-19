#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

var args = process.argv.slice(2);

if (args.length == 0) {
  console.log("Usage: rpc_client.js num");
  process.exit(1);
}
function sender( msg , resHandler){
  amqp.connect('amqp://localhost', function(err, conn) {
    conn.createChannel(function(err, ch) {
      ch.assertQueue('', {exclusive: true}, function(err, cbQueue) {
        var corr = generateUuid();
        console.log(' [x] Requesting fib(%d)', msg);
        ch.consume(cbQueue.queue, function(res){
         responseHandler(res, corr);
         }, {noAck: true});//async
        ch.sendToQueue('rpc_queue',
          new Buffer(msg.toString()),
          { correlationId: corr, replyTo: cbQueue.queue });
      });
    });
  });

};

function responseHandler(res, corr){
  if (res.properties.correlationId == corr) {
    console.log(' [.] Got %s', res.content.toString());
    setTimeout(function() { conn.close(); process.exit(0) }, 500);
  }
};

function generateUuid() {
  return Math.random().toString() +
         Math.random().toString() +
         Math.random().toString();
}
var num = parseInt(args[0]);
sender(num.toString());
