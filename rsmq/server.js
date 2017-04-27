RedisSMQ = require("rsmq");
rsmq = new RedisSMQ( {host: "127.0.0.1", port: 6379, ns: "rsmq"} );
Promise.all(
rsmq.createQueue({qname:"myqueue"})
).then(function(resp){
  if (resp===1)
    console.log("queue created")
}).then(
rsmq.receiveMessage({qname:"myqueue"})
).then(function(resp){
  if (resp.id) {
    console.log("Message received.", resp)      
  }
  else {
    console.log("No messages for me...")
  }
})


