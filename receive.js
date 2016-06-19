var amqp = require("amqplib/callback_api");
var amqServerIp = "dockerip";
var amqp = require('amqplib/callback_api');
amqp.connect('amqp://' + amqServerIp , function(err, conn) {
    if(err){
        console.log(err);
        return -1;
    }
  conn.createChannel(function(err, ch) {
    var q = 'hello';

    ch.assertQueue(q, {durable: false});
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, function(msg) {
      console.log(" [x] Received %s", msg.content.toString());
    }, {noAck: true});
  });
});
