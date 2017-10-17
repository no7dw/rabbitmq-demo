"use strict";

var config = require("../config");
var Producer = require("ons").Producer;
// const addr = "http://onsaddr-internet.aliyun.com:80/rocketmq/nsaddr4client-internet";
const topic = 'kktest';
var producer = new Producer(
    config.pgroup,
    config.accessKey,
    config.secretKey, {
        onsAddr: config.addr
    });
//bug : tag not work 
// new message 12:51:35 { body: 'Hello 5!',
//   msgId: '0BC13362441F72D47B5A3DFB8C24BF9A',
//   reconsumeTimes: 0,
//   startDeliverTime: '1507870295588',
//   topic: 'kktest',
//   tag: null,
//   key: null } 55
  
function send() {
    function p(i) {
        //send
        producer.send(topic, "tagA", "单向 " + i);
    }
    function pasync(i){
        
        //sendAsync
        producer.send(topic, "tagB", "async Hello " + i + "!", 1000, function(err, messageId) {
            console.log(`send ${messageId} comsume done`)
            if(err) console.log(err, messageId);

        });
        
    }

    for(var i = 0; i < 2; i++) {
        //p(i);
        pasync(i);
    }
}

console.log("Connecting to Aliyun ONS...");
producer.start(function() {
    console.log("Started.");
    setTimeout(send, 100);
});

process.on("SIGINT", function() {
    producer.stop(function() {
        process.exit(0);
    });
});
