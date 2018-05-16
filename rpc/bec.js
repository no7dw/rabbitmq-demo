#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var config = require('./config.dev')
var args = process.argv.slice(2);

function generateUuid() {
  return Math.random().toString() +
         Math.random().toString() +
         Math.random().toString();
}
function sub(msg){
  //sub 
  //ch should be a newone
  amqp.connect(config.RABBITMQ_URL, function(err, conn) {
    conn.createChannel(function(err, ch) {
      // var msgJson = JSON.parse(msg);
      var msgJson = msg;
      ch.assertExchange(msgJson.ex, 'fanout', {durable: false});
      ch.assertQueue('', {exclusive: true}, function(err, q) {
        console.log(' [*] Waiting for logs.');
        ch.bindQueue(q.queue, msgJson.ex ,'');
        ch.consume(q.queue, function(msg) {
          console.log("sub [x] %s", msg.content.toString());
        }, {noAck: true});
      })
    })
  })
}

function sender( msg , resHandler){
  amqp.connect(config.RABBITMQ_URL, function(err, conn) {
    conn.createChannel(function(err, ch) {
      ch.assertQueue('', {exclusive: true}, function(err, cbQueue) {
        var corr = generateUuid();
        console.log(' [x] Requesting fib(%s)', msg);
        ch.consume(cbQueue.queue, function(res){ 
          resHandler(res, corr , conn);
         }, {noAck: true});//async
        
        // //sub 
        // //ch should be a newone
        // var msgJson = JSON.parse(msg);
        // ch.assertExchange(msgJson.ex, 'fanout', {durable: false});
        // ch.bindQueue(cbQueue.queue, msgJson.ex ,'');
        // ch.consume(cbQueue.queue, function(msg) {
        //   console.log("sub [x] %s", msg.content.toString());
        // }, {noAck: true});

        ch.sendToQueue('rpc_queue',
          new Buffer(msg),
          { correlationId: corr, replyTo: cbQueue.queue });
      });
    });
  });

};

function responseHandler(res, corr, conn){
  if (res.properties.correlationId == corr) {
    console.log(' [.] Got %s', res.content.toString());
    setTimeout(function() { conn.close(); process.exit(0) }, 30000);
  }
  else{
    console.log(' [.] to disconnect client: Got %s', res.content.toString());
  }
};

// if (args.length == 0) {
//   console.log("Usage: rpc_client.js num");
//   process.exit(1);
// }
// var num = parseInt(args[0]);
var num = {"content":1,"status":"pending","ex":"trade"};
sub(num);
sender(JSON.stringify(num), responseHandler);
