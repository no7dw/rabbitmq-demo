var rpc = require('amqp-rpc').factory({
    url: require('../config').RABBITMQ_URL
});

rpc.call('inc', 5, function() {
    console.log('results of inc:', arguments);  //output: [6,4,7]
});

// rpc.call('say.Hello', { name: 'John' }, function(msg) {
//     console.log('results of say.Hello:', msg);  //output: Hello John!
// });

// rpc.call('withoutCB', {}, function(msg) {
//     console.log('withoutCB results:', msg);  //output: please run function without cb parameter
// });

// rpc.call('withoutCB', {}); //output message on server side console