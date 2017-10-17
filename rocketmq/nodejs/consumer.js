"use strict";

var config = require("../config");
var Consumer = require("ons").Consumer;
var bluebird = require('bluebird');

if(process.env.NODE_ONS_LOG === "true") {
    require("../lib/orig_log").on("data", function(data) {
        console.log("[ORIG]", data);
    });
}
const topic = 'kktest';
// const addr = "http://onsaddr-internet.aliyun.com:80/rocketmq/nsaddr4client-internet";
var consumer = new Consumer(
    config.cgroup,
    topic,
    "*", //tag tagnot work ?
    config.accessKey,
    config.secretKey, {
        onsAddr: config.addr,
        threadNum: 10
    });

var consumed = 0;
consumer.on("message", function(message, ack) {
    console.log('new message',new Date(parseInt(message.startDeliverTime)).toLocaleTimeString() , message, ++consumed);
    bluebird.delay(4000);
    ack.done();
});

consumer.on("error", function(err) {
    console.log(err);
});

console.log("Connecting to Aliyun ONS...");
consumer.init(function() {
    console.log("Initialized.");
    consumer.listen();
    console.log("Listened.");
});

process.on("SIGINT", function() {
    consumer.stop(function() {
        process.exit(0);
    });
});
