### rabbitmq management advance

#### install 

	rabbitmq-plugins enable rabbitmq_management

visit : http://ali3:15672/

#### solve 401 

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
config
/etc/rabbitmq/rabbitmq.config
[example][4]

#### 可以限制发送速度？
no way

#### 如何做警报
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

### not using rabbitmq
不用rabbitmq 的话，log ==> 需要ELK 监控log，手动关闭某个节点或者关闭某些功能。

### 其他典型场景
[see here][5]

### 其他用处
[find bottle neck of your system][6]

### Question
如何需要req 有没有被处理？
如何知道结果处理结果？


  [1]: http://7xk67t.com1.z0.glb.clouddn.com/init.jpg
  [2]: http://7xk67t.com1.z0.glb.clouddn.com/graph.jpg
  [3]: http://7xk67t.com1.z0.glb.clouddn.com/more2.jpg
  [4]: https://github.com/rabbitmq/rabbitmq-server/blob/stable/docs/rabbitmq.config.example
  [5]: https://www.rabbitmq.com/blog/2012/04/25/rabbitmq-performance-measurements-part-2/
  [6]: http://www.rabbitmq.com/blog/2014/04/14/finding-bottlenecks-with-rabbitmq-3-3/