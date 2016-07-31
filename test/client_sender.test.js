// client_sender.js
const rpc_client = require('../rpc/rpc_client_gen')

describe('client', () => {
  it('#1 normal send a message', function * () {
    const msg = "{name:'wade', level: 0 }"
    rpc_client.send( msg, (result) =>{
      console.log("result",result);
      result.should.be.above(0);
    });
  })
});