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
  P -> Q  -> C

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
[see here][8]

### 轮询改进
  queue 模型时，当两个comsumer时，default 轮询方式是round-robin, 为了避免一个忙，另外一个闲的情况出现， 可以设置prefetch 来避免这个问题

### 其他用处
[find bottle neck of your system][9]

### FAQ
- 如何知道message有没有被consume？
- 如何知道结果处理结果？
[使用RPC模式][10]
就是当普通http请求一样（有个msg ID）。server 会返回结果。结果存在reply_to 的queue (附上msgID)。 client 会去拿(根据msgID 知道对应上具体发送那个请求)。

client 同时是rpc queue的producer & reply_queue 的consumer 
server 同时是reply_queue的producer & rpc queue的consumer

![此处输入图片的描述][11]

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


 - comsume it [更优雅的方法][17]（推荐）

更好的是跳过改消息with timeout，存储下来，如db，然后取下一个。
然后review，让程序重新对这些结果进行consume。

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
 - Exchange: Receives messages from producers and pushes them to queues depending on rules defined by the exchange type. In order to receive messages, a queue needs to be bound to at least one exchange.
 - Binding: A binding is a link between a queue and an exchange.
 - Routing key: The routing key is a key that the exchange looks at to decide how to route the message to queues. The routing key is like an address for the message.
 - AMQP: AMQP (Advanced Message Queuing Protocol) is the protocol used by RabbitMQ for messaging.
 - Users: It is possible to connect to RabbitMQ with a given username and password. Every user can be assigned permissions such as rights to read, write and configure privileges within the instance. Users can also be assigned permissions to specific virtual hosts.
 - Vhost, virtual host: A Virtual host provide a way to segregate applications using the same RabbitMQ instance. Different users can have different access privileges to different vhost and queues and exchanges can be created so they only exists in one vhost.

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

 官方提供的例子没有按照promise and generator 方式编写。稍微封装改写了一下：
 - [generator][23]
 - [promise][24]
 
### 上面的generator 例子碰到的坑
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
### 一致性保证
  为了完成用户的一个请求，后台通常对应多个远程调用，后台如何保证事务的一致性成为了难题。以转账为例,A给B转账，两人原账户各有1000，数据版本号为a1,b1两个步骤为从A扣除100，给B增加100，假如A扣除这步成功了，但给B增加这个步骤超时了呢？给B到底增加了没有？

  在操作前给这个步骤分配唯一编号 Tid，A(a1)减100 ,然后写日志(Tid, s1,a1, -100,a2)。
  
  同理操作B(b1)增加100,然后写日志(Tid, s2,b1, +100,b2）。

  Q:
 - 如果日志写失败了呢？因为数据是有版本号的，重试不会减两次。
 - 如果操作B过程超时了，也重试。有了操作日志，可以灵活的选择回滚还是重试，重试的时机是立即还是延后。在消息系统里，每条消息也被分配了唯一ID，确保操作的可追溯可重试。

[ref:使用RabbitMQ的事件驱动微服务](https://mp.weixin.qq.com/s?__biz=MzA5OTAyNzQ2OA==&mid=2649691705&idx=1&sn=f6ab0795d5eef8202b8a7277e9632009&chksm=8893295abfe4a04c32ec4599a0afddfad1e3300e2b8fa029e8df083d90c847e68a0cd8f5e716&scene=1&srcid=0922Wghg1M0sLDWZYUoWuF1y&key=1a6dc58b177dc6268ad892cc8c35acf4e050d519205d7ffa81bda3af2c217e97aad2b7b9f479c48acbee5f6f0f850383&ascene=0&uin=MjQ2NTA3MzgwMg%3D%3D&devicetype=iMac+MacBookPro12%2C1+OSX+OSX+10.11.6+build(15G1004)&version=11020201&pass_ticket=PJGkgI0NQsaen6M0WEF6NjT0CNcnSUFyH2xuxAHMRLeKU4jMX8CbpKrOQ%2FKDlTsz)

### 高可用
  
  为保证mq节点挂掉，系统要正常运转，需要做高可用处理，比较合适的是采用mirror模式，简单地通过haproxy 来进行转发。
 - [高可用配置](http://www.cnblogs.com/flat_peach/archive/2013/04/07/3004008.html)
 - [高可用配置 mirror mode](http://88250.b3log.org/rabbitmq-clustering-ha)



### 如果不选mq？
拆解系统过程中，如果不选mq来替代http rest ，还有选择吗？
   
   调用rest场景：
   - thrift RPC
   - Raw TCP/UDP
   - Redis pub/sub



### 更多参考

  - [消息队列服务rabbitmq安装配置][26]
  - [rabbitmq 集群高可用测试][27]
  - [open-falcon][28] 
  - [gitbook open-falcon][29]
  - [rabbitmq & spring amqp][30]
  - [可靠的消息系统][31]



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
