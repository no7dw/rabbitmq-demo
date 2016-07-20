'use strict';

const config = require('./config')
const amqp = require('amqplib').connect('amqp://' + config.username + ':' + config.password + '@ali3')
const co = require('co')

const args = process.argv.slice(2)

if (args.length == 0) {
    console.log("Usage: rpc_client.js num");
    process.exit(1)
}

function generateUuid() {
    return Math.random().toString() +
        Math.random().toString() +
        Math.random().toString()
}

function* sender(msg, resHandler) {
    try {
        let conn = yield amqp
        let ch = yield conn.createChannel()
        let cbQueue = yield ch.assertQueue('', {exclusive: true})
        const corr = generateUuid()
        console.log(' [x] Requesting fib(%d)', msg)
        ch.consume(cbQueue.queue, (resultMsg) => {
            resHandler(resultMsg, corr, conn)
        })
        ch.sendToQueue('rpc_queue', new Buffer(msg.toString()), {"correlationId": corr, "replyTo": cbQueue.queue})
        //return conn
    }
    catch (ex) {
        console.warn("ex:", ex)
    }
}

function responseHandler(res, corr, conn) {
    if (res.properties.correlationId == corr) {
        console.log(' [.] Got %s', res.content.toString());
        setTimeout(  () =>  {
            conn.close()
            process.exit(0)
        }, 500);
    }
};

function onerror(err) {
    console.error(err.stack);
}

co(function*() {
    let num = parseInt(args[0])
    yield sender(num.toString(), responseHandler)
}).then({
    //should close and exit here
}, onerror)
