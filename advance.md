### rabbitmq management advance

#### management install 

  rabbitmq-plugins enable rabbitmq_management


----------


visit : http://ali3:15672/
管理页面的进程与rabbitmq-server 是分开的


#### solve management webpage 401 problem 

  abbitmqctl add_user test test
  rabbitmqctl set_user_tags test administrator
  rabbitmqctl set_permissions -p / test ".*" ".*" ".*"

after fresh install:
![fresh install][1]

with data:
![with data][2]

with more data:
![此处输入图片的描述][3]

### unsolved why lost message?

    klg@klgaliyun03:~/rabbitmq-demo/queues$ node worker.js 
     [*] Waiting for messages in task_queue. To exit press CTRL+C
     [x] Received 9
     [x] Done
     [x] Received 0
     [x] Done
     [x] Received 2
     [x] Done
     [x] Received 4
     [x] Done
     [x] Received 6
     [x] Done
     [x] Received 8
     [x] Done

### you can send without consumers, but later consumers is up, while the message still can be received.
so where is the max ? see the following


### config advance  
[config manual][4]
/etc/rabbitmq/rabbitmq.config
[example][5]

#### 可以限制发送速度？
no way？ 
无需配置，系统根据consumer 的处理速度，限制producer 的发送带宽，以限制producer发送的速度。
[flow control][6]

### 提高consumer吞吐
  尝试oneway，例如log 收集日记，如果不需要高可靠性，用最basic的模式：只send ，不care 返回
  ![img](https://camo.githubusercontent.com/d61929e2c351b097e5a3b1137354327069734a43/687474703a2f2f7777772e7261626269746d712e636f6d2f696d672f7475746f7269616c732f707974686f6e2d6f6e652e706e67)

### 注意事项
 - consumer端必定要注意消息重复的问题，要做成**幂等**。
 - 场景 步骤典型选择
错：
 ![img](http://oqln5pzeb.bkt.clouddn.com/17-10-10/84174773.jpg)
对： 
 ![img](http://oqln5pzeb.bkt.clouddn.com/17-10-10/68585214.jpg)


#### 如何做警报
    [api][7]
    root@klgaliyun03:~# curl -i -u guest:guest http://localhost:15672/api/vhosts
    HTTP/1.1 200 OK
    vary: Accept-Encoding, origin
    Server: MochiWeb/1.1 WebMachine/1.10.0 (never breaks eye contact)
    Date: Thu, 23 Jun 2016 12:07:11 GMT
    Content-Type: application/json
    Content-Length: 907
    Cache-Control: no-cache
    
    [{"message_stats":{"publish":219,"publish_details":{"rate":1.6},"publish_in":0,"publish_in_details":{"rate":0.0},"publish_out":0,"publish_out_details":{"rate":0.0},"ack":179,"ack_details":{"rate":1.0},"deliver_get":180,"deliver_get_details":{"rate":1.0},"confirm":0,"confirm_details":{"rate":0.0},"return_unroutable":0,"return_unroutable_details":{"rate":0.0},"redeliver":0,"redeliver_details":{"rate":0.0},"deliver":180,"deliver_details":{"rate":1.0},"deliver_no_ack":0,"deliver_no_ack_details":{"rate":0.0},"get":0,"get_details":{"rate":0.0},"get_no_ack":0,"get_no_ack_details":{"rate":0.0}},"send_oct":183288,"send_oct_details":{"rate":2896.8},"recv_oct":129734,"recv_oct_details":{"rate":2097.0},"messages":31,"messages_details":{"rate":1.2},"messages_ready":30,"messages_ready_details":{"rate":1.2},"messages_unacknowledged":1,"messages_unacknowledged_details":{"rate":0.0},"name":"/","tracing":false}]

**send_oct_details**


### 其他典型场景
削减波峰，保护后端（消费端）
![波峰](http://oqln5pzeb.bkt.clouddn.com/17-10-17/45114985.jpg)
[see here][8]
削减波峰 关键一个控制消费端参数的是 prefetch 
如下方

    ch.prefetch(1); //一个消费完了才接下一个
    ch.prefetch(3); //一次拿3个去尝试消费，没ack成功的话会被重发
    ch.prefetch(0); //一次拿n个，具体多少待确定

如下方演示图prefetch多个：
 ![prefetch3](http://7xk67t.com1.z0.glb.clouddn.com/prefetch.gif) 
如下方演示图prefetch一个接一个：
 ![prefetch1](http://7xk67t.com1.z0.glb.clouddn.com/mulMessage.gif) 

### 轮询改进
  queue 模型时，当两个comsumer时，default 轮询方式是round-robin, 为了避免一个忙，另外一个闲的情况出现， 可以设置prefetch 来避免这个问题

### 其他用处
[find bottle neck of your system][9]

### FAQ
- 如何知道message有没有被consume？
- 如何知道结果处理结果？
- 如果客户端已经断开了link？

[使用RPC模式][10]
![此处输入图片的描述][11]

就是当普通http请求一样（有个msg ID）。server 会返回结果。结果存在reply_to 的queue (附上msgID)。 client 会去拿(根据msgID 知道对应上具体发送那个请求)。

client 同时是rpc queue的producer & reply_queue 的consumer 
server 同时是reply_queue的producer & rpc queue的consumer



需要优雅处理几件事情：
   - server 端连不上 -- 重连or抛错
   - client 端连接超时
   - client 端rpc模式超时
   - 防重：server 端都要处理重复消息的问题，client 端要处理重复reply的问题

![流程解析](http://oqln5pzeb.bkt.clouddn.com/17-10-17/12401634.jpg)

5断了的case：
server&client 端消息重复的效果演示：
![重复问题](http://7xk67t.com1.z0.glb.clouddn.com/dulplicate.gif)   
留意:


    handler(req)
    .then(fResult =>{
      console.log("handle complete, send result to client", fResult);
      ch.sendToQueue(req.properties.replyTo,new Buffer( JSON.stringify( fResult) ), {correlationId: req.properties.correlationId});//sync send the result back to client
      console.log('delay finish in 5s');
      bluebird.delay(5000).then(function(){
        ch.ack(req);  
        console.log('finish ack');
      });
    });

  
第一次是正常运行
第二次运行，在reply 后，中断右边的server端的ack 回复，然后重启server端，server则接收到第二次的重复消息
接下来server消费第二次重复消息，然后relpy, ack。
client 收到两次返回

  $ node rpc_client.js 8
   [x] Requesting fib(8)
   [.] Got 8
   [.] Got 8  <--- 重复的
 
### 保证客户端的接收
[客户等待返回时断开了怎么办](https://www.rabbitmq.com/direct-reply-to.html)
使用rpc 模式时，利用reply to 去维持一个长的连接，但是并非一个新的queue。
如果在等待回应的过程中，客户crash了，server是没办法去发送的回去的。客户理应重新再发一遍。
server 端如何感知这个事情呢？(TBD)

再来这张图：
![流程解析](http://oqln5pzeb.bkt.clouddn.com/17-10-17/12401634.jpg)

3断了，客户重试。

Client (A B)双节点， Server (C D)双节点。
RPC 模式下：
Client-------- Server
A—>m1—>C
B—>m2—>D  
C想reply A的时候，A(down了) disconnect 了怎么办。A没办法收到，即便B还在正常工作。

所以比较稳定的模式应该是这样 working queue + pub/sub
![回调网关](http://oqln5pzeb.bkt.clouddn.com/17-10-17/32211417.jpg)

- what if rabbitmq-server is killed ？ 
message will be lost , util we set :

    ch.assertQueue('task_queue', {durable: true});
    ch.sendToQueue(q, new Buffer(msg), {persistent: true});

In the meanwile we better use HA solution.
[Note that: this is not 100% guarantee message won't lost.][12]


- what if consumer is killed, will the message lost? -- queue 在就行, set noAck:false

> In order to make sure a message is never lost, RabbitMQ supports
> message acknowledgments. An ack(nowledgement) is sent back from the
> consumer to tell RabbitMQ that a particular message has been received,
> processed and that RabbitMQ is free to delete it.
> 
> If a consumer dies (its channel is closed, connection is closed, or
> TCP connection is lost) without sending an ack, RabbitMQ will
> understand that a message wasn't processed fully and will re-queue it.
> If there are other consumers online at the same time, it will then
> quickly redeliver it to another consumer. That way you can be sure
> that no message is lost, even if the workers occasionally die.

- what if consumer took too long to handle the message?

> There aren't any message timeouts; RabbitMQ will redeliver the message when the consumer dies. It's fine even if processing a message takes a very, very long time.


### RPC problem:
RPC 测试时，服务端有个消息处理卡住，就永远的卡住，
如下图：
![此处输入图片的描述][13]
获取卡住的消息
![此处输入图片的描述][14]
可以
  - delete queue
how:

    rabbitmqadmin -u {user} -p {password} -V {vhost} delete queue name={name}

[example to delete queue][15]:

    rabbitmqadmin  -u {user} -p {password} -V / delete queue name=rpc_queue  



 - purge 清空 queue

 http://localhost:15672/#/queues/%2F/rpc_queue

 - move 改队列的所有消息 （推荐） （不能移除单个）

 To move messages, the shovel plugin must be enabled, try:

    $ rabbitmq-plugins enable rabbitmq_shovel rabbitmq_shovel_management

![此处输入图片的描述][16]
 相当于有一个“垃圾”消息队列（填写上图destination queue），这些记录着你不能正常consume的,
 然后接下来一步相当重要：
   - 修正server端不能consume 的原因
   - 重启server端
   - 将“垃圾”消息队列，重新移动会正常队列，进行消费

 - consume it [方向是按需消费有问题消息，不是删除][17]

如何更好的consume：
   - 方法1：跳过改消息with timeout，存储下来，如db，然后取下一个。
然后review，让程序重新对这些结果进行consume。
   - 方法2： worker 对失败的消息设置最大重试次数，超过阈值则把发送到别的队列里面。通过后台、UI 界面监控/显示 这些消息。修正问题后，按需把此失败消息触发下重试。（推荐）

上面的异常消息从worker表现来说，除了卡住之外，严重的还很可能导致worker 崩溃，甚至多个worker 集体的崩溃(另外一个worker 接了此消息，接着崩溃) -- 即所谓(catastrophic failover)。
所以对队列的堆积情况监控是非常必要的。

针对这种超时的处理，可以参考这个link：
https://www.rabbitmq.com/dlx.html
https://www.rabbitmq.com/ttl.html
https://docs.microsoft.com/en-us/azure/service-bus-messaging/service-bus-performance-improvements



### [概念][18]
 - Producer: Application that sends the messages.
 - Consumer: Application that receives the messages.
 - Queue: Buffer that stores messages.
 - Message: Information that is sent from the producer to a consumer through RabbitMQ.
 - Connection: A connection is a TCP connection between your application and the RabbitMQ broker.
 - Channel: A channel is a virtual connection inside a connection. When you are  - publishing or consuming messages or subscribing to a queue is it all done over a channel.
 - Exchange: Receives messages from producers and pushes them to queues depending on rules defined by the exchange type. In order to receive messages, a queue needs to be bound to at least one exchange. 理解为消息交易所or消息分发器。他一边接收producer，另外一边根据规则(routing/topic)做消息的分发
 - Binding: A binding is a link between a queue and an exchange.
 - Routing key: The routing key is a key that the exchange looks at to decide how to route the message to queues. The routing key is like an address for the message. 理解为从exchange 到queue的分发规则
 - AMQP: AMQP (Advanced Message Queuing Protocol) is the protocol used by RabbitMQ for messaging.
 - Users: It is possible to connect to RabbitMQ with a given username and password. Every user can be assigned permissions such as rights to read, write and configure privileges within the instance. Users can also be assigned permissions to specific virtual hosts.
 - Vhost, virtual host: A Virtual host provide a way to segregate applications using the same RabbitMQ instance. Different users can have different access privileges to different vhost and queues and exchanges can be created so they only exists in one vhost.理解为用于一个mq实例，模拟不同的机器的配置，用处在于限制不用的用户权限、配置。
 - publish(in/out)
 - confirm
 - deliver
 - redelivered
 - acknowledge

### npm package
[原有的demo实例][19]结构不够好，每次都要create操作，使用以下的npm，或者[自行封装][20]
 - [node-amqp][21]
 - [amqp.node][22]
 - [coworkers](https://github.com/tjmehta/coworkers)
 - [amqplib-rpc](https://github.com/tjmehta/amqplib-rpc)
 - [servicebus](https://www.npmjs.com/package/servicebus)
 - [servicebus-retry](https://www.npmjs.com/package/servicebus-retry)

 官方提供的例子没有按照promise and generator 方式编写。稍微封装改写了一下：
 - [generator][23]
 - [promise][24]
 
### 碰到的坑
  本来想将官方的例子进行封装：尝试两次发送消息都共用同一connection, channel, callback queue。结果返回的消息里面uuid 都是同一个uuid。
  所以暂时需要每次发送前，都要初始化一次。
  可能猜测：amqp 是基于tcp 的，如果不同客户端的去往服务端发消息，理论上是不可以用同一个tcp connection。
  但如果是同一个客户端不停的发消息，tcp 不close，就一直可以发信息了。

  测试：

    ```
    //run twice
    ch.sendToQueue(q, new Buffer(msg), {persistent: true});
    ch.sendToQueue(q, new Buffer(msg), {persistent: true});
    ```
  
    klg@klgaliyun03:~/rabbitmq-demo/queues$ node task-client.js
    [x] Sent 'Hello World!'

    //can receive two message
    klg@klgaliyun03:~/rabbitmq-demo/queues$ node worker-server.js
     [*] Waiting for messages in task_queue. To exit press CTRL+C
     [x] Received Hello World!
     [x] Done
     [x] Received Hello World!
     [x] Done

  参考[别人同样遇到][25]这个问题。



### more advance  
 - [RabbitMQ说明](https://github.com/sky-big/RabbitMQ/)
 - [taobao info rabbitmq](https://github.com/sky-big/RabbitMQ/tree/master/%E6%B7%98%E5%AE%9DRabbitMQ%E5%AE%9E%E9%AA%8C%E8%B5%84%E6%96%99)


### 高可用
  
  为保证mq节点挂掉，系统要正常运转，需要做高可用处理，比较合适的是采用mirror模式，简单地通过haproxy 来进行转发。
 - [高可用配置](http://www.cnblogs.com/flat_peach/archive/2013/04/07/3004008.html)
 - [高可用配置 mirror mode](http://88250.b3log.org/rabbitmq-clustering-ha)

### 平滑过渡
 重启避免拿了消息处理到一半，挂掉的处理：[cancel link ref](https://www.rabbitmq.com/consumer-cancel.html)

 - 收到重启消息进行reject
 - 收到重启消息进行cancel

  ```
    var consumerInfo  ={}
    consumerInfo = ch.consumer(queue, function(req)){
      ...
      ch.cancel(Object.keys(consumerInfo.consumer)[0])
    }
  ```

### 如果不选mq？
拆解系统过程中，如果不选mq来替代http rest ，还有选择吗？
   
   调用rest场景：
   - sync 改成 async 回调 (注意重试，重试注意 exponential backoff ，否则造成累计波峰)
   - thrift RPC
   - Raw TCP/UDP
   - Redis pub/sub
   - Retry http

### Performance

Docker 3GRAM CPU?
DISK mode:
 - 生产 ~8k/s
 - 消费 ~1k/s

RAM mode:
 - 生产 ~10k/s
 - 消费 ~2k/s


### 总结
什么时候不使用MQ？
上游实时关注执行结果
 
什么时候使用MQ？
1）数据驱动的任务依赖
2）上游不关心多下游执行结果
3）异步返回执行时间长

### 更多参考

  - [消息队列服务rabbitmq安装配置][26]
  - [rabbitmq 集群高可用测试][27]
  - [open-falcon][28] 
  - [gitbook open-falcon][29]
  - [rabbitmq & spring amqp][30]
  - [可靠的消息系统][31]
  - [Exponential Backoff and Jitter](https://www.awsarchitectureblog.com/2015/03/backoff.html)
  - [Exponential Backoff with RabbitMQ](https://m.alphasights.com/exponential-backoff-with-rabbitmq-78386b9bec81)
  - [RabbitMQ with Exponential Backoff](https://felipeelias.github.io/rabbitmq/2016/02/22/rabbitmq-exponential-backoff.html)
  - [Easy Retries with RabbitMQ](https://gagnechris.wordpress.com/2015/09/19/easy-retries-with-rabbitmq/)
  - [使用RabbitMQ的事件驱动微服务](https://mp.weixin.qq.com/s/1NH1K3St-6W8I71Rz7x4Yg)
  - [10招，提升你的微服务架构可用性](https://mp.weixin.qq.com/s/W-Q4wmGeuSWNHn3cCnN4qw)
  - [阿里RocketMQ如何解决消息的顺序&重复两大硬伤？](https://mp.weixin.qq.com/s/bdmWPU-5xuT8ijDR236SKA)
  - [解决rabbitmq消息队列的顺序及重复消费问题](http://xiaorui.cc/2017/05/04/%E8%A7%A3%E5%86%B3rabbitmq%E6%B6%88%E6%81%AF%E9%98%9F%E5%88%97%E7%9A%84%E9%A1%BA%E5%BA%8F%E5%8F%8A%E9%87%8D%E5%A4%8D%E6%B6%88%E8%B4%B9%E9%97%AE%E9%A2%98/)
 


  [1]: http://7xk67t.com1.z0.glb.clouddn.com/init.jpg
  [2]: http://7xk67t.com1.z0.glb.clouddn.com/graph.jpg
  [3]: http://7xk67t.com1.z0.glb.clouddn.com/more2.jpg
  [4]: https://www.rabbitmq.com/configure.html
  [5]: https://github.com/rabbitmq/rabbitmq-server/blob/stable/docs/rabbitmq.config.example
  [6]: https://www.rabbitmq.com/flow-control.html
  [7]: http://localhost:15672/api/
  [8]: https://www.rabbitmq.com/blog/2012/04/25/rabbitmq-performance-measurements-part-2/
  [9]: http://www.rabbitmq.com/blog/2014/04/14/finding-bottlenecks-with-rabbitmq-3-3/
  [10]: https://www.rabbitmq.com/tutorials/tutorial-six-javascript.html
  [11]: https://www.rabbitmq.com/img/tutorials/python-six.png
  [12]: http://www.rabbitmq.com/tutorials/tutorial-two-javascript.html
  [13]: http://7xk67t.com1.z0.glb.clouddn.com/waiting.png
  [14]: http://7xk67t.com1.z0.glb.clouddn.com/rabbitmq-get-msg.png
  [15]: http://stackoverflow.com/questions/6742938/deleting-queues-in-rabbitmq
  [16]: http://7xk67t.com1.z0.glb.clouddn.com/move-msg.png
  [17]: https://www.quora.com/RabbitMQ-Is-it-possible-to-remove-a-message-after-it-is-queued
  [18]: https://www.cloudamqp.com/blog/2015-05-18-part1-rabbitmq-for-beginners-what-is-rabbitmq.html
  [19]: https://www.rabbitmq.com/tutorials/tutorial-three-javascript.html
  [20]: https://github.com/no7dw/rabbitmq-demo/blob/master/rpc/rpc_server.js
  [21]: https://github.com/postwait/node-amqp
  [22]: https://github.com/squaremo/amqp.node
  [23]: https://github.com/no7dw/rabbitmq-demo/blob/master/rpc/rpc_client_gen.js
  [24]: https://github.com/no7dw/rabbitmq-demo/blob/master/rpc/rpc_client_promise.js
  [25]: http://stackoverflow.com/questions/34406347/rabbitmq-rpc-implementation-share-the-same-reply-queue/38484316#38484316
  [26]: http://www.ttlsa.com/linux/install-rabbitmq-on-linux/
  [27]: http://www.cnblogs.com/flat_peach/archive/2013/04/07/3004008.html
  [28]: http://open-falcon.org/
  [29]: http://book.open-falcon.org/zh/intro/index.html
  [30]: http://wuaner.iteye.com/blog/1740566
  [31]: http://djt.qq.com/article/view/1475
