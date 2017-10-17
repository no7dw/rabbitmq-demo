'use strict';

const httpclient = require('urllib');
const Consumer = require('ali-ons').Consumer;

const config = require('./config')

const consumer = new Consumer({
  httpclient,
  accessKey: config.accessKey,
  secretKey: config.secretKey,
  consumerGroup: config.cgroup,
  // isBroadcast: true,
});
const topic = 'kktest'
consumer.subscribe(topic, '*', function*(msg) {
  console.log(`\n\nreceive message, msgId: ${msg.msgId}, body: ${msg.body.toString()} \n ${msgId}` )
});

consumer.on('error', err => console.log(err));