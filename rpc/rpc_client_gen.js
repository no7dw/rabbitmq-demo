'use strict';

const config = require('../config.dev')
const amqp = require('amqplib').connect('amqp://' + config.username + ':' + config.password + '@' + config.host)
const co = require('co')
const uuid = require('uuid');

//TODO : wrap it as a class

// const args = process.argv.slice(2)

// if (args.length == 0) {
//     console.log("Usage: rpc_client.js num");
//     process.exit(1)
// }

function* init(){
    let conn = yield amqp
    let ch = yield conn.createChannel()
    let cbQueue = yield ch.assertQueue('', {exclusive: true})
    return {"conn": conn, "channel": ch, "cbQueue": cbQueue}
}

function* sender(initConfig, msg, resHandler) {
    try {
        let ch = initConfig.channel
        let conn = initConfig.conn
        let cbQueue = initConfig.cbQueue

        const corr = uuid.v4()
        console.log(' [x] [%s] Requesting fib(%s)',corr, msg)
        ch.consume(cbQueue.queue, (resultMsg) => {
            resHandler(resultMsg, corr, conn)
        })
        ch.sendToQueue('rpc_queue', new Buffer(msg.toString()), {"correlationId": corr, "replyTo": cbQueue.queue})
    }
    catch (ex) {
        console.warn("ex:", ex)
    }
}
//客户端最好需要对消息防止重复处理,超时没有返回结果的要进行超时处理
//服务端:先存储到db, 然后当做消费他.后续补充这些异常消息的处理
function responseHandler(res, corr, conn) {
    // console.log("corr: %s - %s", corr, JSON.stringify(res.content.toString() ) );
    if (res.properties.correlationId == corr)
    {
        // console.log(' [.] Got %s', JSON.stringify(res.content.toString() ));
        setTimeout(  () =>  {
            conn.close()
        }, 5000);
    }
    return res.content
};



exports.send = function * (msg, responseHandler) {
  let initConfig = yield init();
  yield sender(initConfig, msg, responseHandler );
}

function onerror(err) {
    console.error(err.stack);
}

co(function*() {
    let num = parseInt(args[0])
    let initConfig = yield init();
    yield [
        sender(initConfig, num.toString(), responseHandler),
    ]
}, onerror)
