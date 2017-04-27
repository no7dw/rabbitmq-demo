RedisSMQ = require("rsmq");
rsmq = new RedisSMQ( {host: "127.0.0.1", port: 6379, ns: "rsmq"} );

rsmq.createQueue({qname:"myqueue"}, function (err, resp) {
  if (resp===1) {
    console.log("queue created")
  }
  else
    console.error('err', err)
});
rsmq.sendMessage({qname:"myqueue", message:"Hello World"}, function (err, resp) {
  if (resp) {
    console.log("Message sent. ID:", resp);
  }
  else
    console.error('err', err)
});
