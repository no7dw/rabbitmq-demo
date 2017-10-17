var rpc = require('amqp-rpc').factory({
    url: require('../config').RABBITMQ_URL
});


rpc.on('inc', function(param, cb){
    var prevVal = param;
    var nextVal = param+2;
    setTimeout(function(){
      cb(++param, prevVal, nextVal);
    }, 4000);
    
});

rpc.on('say.*', function(param, cb, inf){

    var arr = inf.cmd.split('.');

    var name = (param && param.name) ? param.name : 'world';

    cb(arr[1] + ' ' + name + '!');

});

rpc.on('withoutCB', function(param, cb, inf) {

  if(cb){
    cb('please run function without cb parameter')
  }
  else{
    console.log('this is function withoutCB');
  }

});