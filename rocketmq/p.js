'use strict';

const httpclient = require('urllib');
const Producer = require('ali-ons').Producer;
const Message = require('ali-ons').Message;
const config = require('./config')
const producer = new Producer({
  httpclient,
  accessKey: config.accessKey,
  secretKey: config.secretKey,
  producerGroup: config.pgroup,
});

producer.ready(() => {
  console.log('producer ready');
  const topic = 'kktest'
  const msg = new Message(topic, // topic
    'TagA', // tag
    'Hello ONS !!! ' // body
  );

  producer.send(msg, (err, sendResult) => {
    console.log('===========')
    console.log(err, sendResult);
  }) 
});