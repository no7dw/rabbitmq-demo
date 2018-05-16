#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var config = require('./config.dev')
var args = process.argv.slice(2);

function generateUuid() {
  return Math.random().toString() +
         Math.random().toString() +
         Math.random().toString();
}
var wresult = "waiting"

//异步pub/sub结果
function notify(msg){
  if(wresult != "done" ){ //check in redis/db
    // console.log( msg);
    console.log("THE REAL WORK [x] ", msg.content.toString());
    wresult = "done";
  }else{
    console.log("Already done");
  }
}

function sub(ch, msg, notifyHandler){
  //sub 
  console.log('sub msg', msg);
  var msgJson = msg;
  ch.assertExchange('trade', 'fanout', {durable: false});
  ch.assertQueue('', {exclusive: true}, (err, q) => {
    console.log(' [*] Waiting for logs.');
    ch.bindQueue(q.queue, msgJson.ex ,'');
    ch.consume(q.queue, (msg) => {
      notifyHandler(msg);
    }, {noAck: true});
  })
}

function setupSender( msg , resHandler){
  amqp.connect(config.RABBITMQ_URL, (err, conn) => {
    conn.createChannel((err, ch) =>{
      ch.assertQueue('', {exclusive: true}, (err, cbQueue)=> {
        var corr = generateUuid();
        console.log(' [x] Requesting fib(%s)', msg);
        //rpc callback
        ch.consume(cbQueue.queue, (res)=>{ 
          resHandler(res, corr , conn);
         }, {noAck: true});//async

        sub(ch, msg , notify);

        //call rpc
        ch.sendToQueue('rpc_queue',new Buffer(msg),{ correlationId: corr, replyTo: cbQueue.queue });
      });
    });
  });

};

function responseHandler(res, corr, conn){
  if (res.properties.correlationId == corr) {    
    console.log('From RPC reply [.]');
    notify(res.content.toString());
    // setTimeout(function() { conn.close(); process.exit(0) }, 30000);
  }else{
    console.log(' [.] to disconnect client: Got %s', res.content.toString());
  }
};

if (args.length == 0) {
  console.log("Usage: rpc_client.js num");
  process.exit(1);
}
var num = parseInt(args[0]);
var content = {"content":num,"status":"pending","ex":"trade"};


setupSender(JSON.stringify(content), responseHandler);
