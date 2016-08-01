// client_sender.js

const rpc_client = require('./rpc/rpc_client_gen')
const co = require('co')
const msg = '{"name":"wade", "level": 0 }'

function onerror(err) {
    console.error(err.stack);
}

co(function*() {
    
    yield rpc_client.send( msg, (result) =>{
      const jsonResult = JSON.parse(result.content) ;
      console.log("server return result:", jsonResult);
      process.exit(0)
    });
}, onerror)
