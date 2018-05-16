#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var config = require('./config.dev')
var args = process.argv.slice(2);
var bluebird = require('bluebird');

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
    if(msg.content)
      console.log("THE REAL WORK [x] ", msg.content.toString());
    wresult = "done";
  }else{
    console.log("Already done");
  }
}
//对账 补单

//sub 
function sub(msg, notifyHandler){
  
  amqp.connect(config.RABBITMQ_URL, function(err, conn) {
    if(err){
      console.log("err", err);
      return
    }
    conn.createChannel((err, ch) =>{
      // var msgJson = JSON.parse(msg);
      var msgJson = msg;
      ch.assertExchange(msgJson.ex, 'fanout', {durable: false});
      ch.assertQueue('', {exclusive: true}, (err, q) => {
        console.log(' [*] Waiting for logs.');
        ch.bindQueue(q.queue, msgJson.ex ,'');
        ch.consume(q.queue, (msg) => {
          notifyHandler(msg);
        }, {noAck: true});
      })
    })
  })
}

function sender( msg , resHandler){
  amqp.connect(config.RABBITMQ_URL, (err, conn) => {
    if(err){
      console.log("err", err);
      return
    }
    conn.createChannel((err, ch) =>{
      ch.assertQueue('', {exclusive: true}, (err, cbQueue)=> {
        var corr = generateUuid();
        console.log(' [x] Requesting fib(%s)', msg);
        //rpc callback
        ch.consume(cbQueue.queue, (res)=>{ 
          resHandler(res, corr , conn);
          console.log('sleep 5s');
          bluebird.delay(5000).then(function(){
            ch.ack(res);
          })
         }, {noAck: false});//async
        //call rpc
        ch.sendToQueue('rpc_queue',new Buffer(msg),{ correlationId: corr, replyTo: cbQueue.queue });
      });
    });
  });

};

function responseHandler(res, corr, conn){
  if (res.properties.correlationId == corr) {    
    console.log('From RPC reply [.]', res.content.toString());
    notify(res.content.toString());
    // setTimeout(function() { conn.close(); process.exit(0) }, 30000);
  }else{
    console.log(' [.] to disconnect client: Got %s', res.content.toString());
  }
};

var num = parseInt(args[0]) ;
var content = {"content":num,"status":"pending","ex":"trade"};

sub(content, function(msg){
  console.log("from sub");
  notify(msg);
});
sender(JSON.stringify(content), responseHandler);
