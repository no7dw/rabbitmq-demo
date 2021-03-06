# rabbitmq-demo

### start log

	klg@klgaliyun03:~/rabbitmq-demo/queues$ sudo !!
	sudo rabbitmq-server 

	              RabbitMQ 3.6.2. Copyright (C) 2007-2016 Pivotal Software, Inc.
	  ##  ##      Licensed under the MPL.  See http://www.rabbitmq.com/
	  ##  ##
	  ##########  Logs: /var/log/rabbitmq/rabbit@klgaliyun03.log
	  ######  ##        /var/log/rabbitmq/rabbit@klgaliyun03-sasl.log
	  ##########
	              Starting broker...
	 completed with 6 plugins.


### basic hello world demo
![此处输入图片的描述][1]

#### producer

	klg@klgaliyun03:~/demo$ node send.js
	 [x] Sent 'Hello World!'

#### list_queues

	klg@klgaliyun03:~$ sudo !!
	sudo rabbitmqctl list_queues
	[sudo] password for klg: 
	Listing queues ...
	hello	1

#### consumer

	klg@klgaliyun03:~/demo$ node receive.js 
	 [*] Waiting for messages in hello. To exit press CTRL+C
	 [x] Received Hello World!

#### list_queues ag ain

	klg@klgaliyun03:~/demo$ sudo rabbitmqctl list_queues
	[sudo] password for klg: 
	Listing queues ...
	hello	0


### work queues demo2	
![此处输入图片的描述][2]

#### producer

	klg@klgaliyun03:~/rabbitmq-demo/queues$ node new_task.js "hello world5"
	 [x] Sent 'hello world5'
	klg@klgaliyun03:~/rabbitmq-demo/queues$ node new_task.js "hello world5"
	 [x] Sent 'hello world5'

#### consumer

	klg@klgaliyun03:~/rabbitmq-demo/queues$ node worker.js 
	 [*] Waiting for messages in task_queue. To exit press CTRL+C
	 [x] Received hello world5
	 [x] Done
	 [x] Received hello world5
	 [x] Done
	 [x] Received hello world5
	 [x] Done
	 [x] Received hello world5
	 [x] Done	 

#### list_queues

	root@klgaliyun03:~# for((i=0;i<20;i+=1));do rabbitmqctl list_queues ;  done
	Listing queues ...
	hello	0
	task_queue	0
	task_queue	1
	Listing queues ...
	hello	0
	task_queue	2
	Listing queues ...
	hello	0
	task_queue	3
	Listing queues ...
	hello	0
	task_queue	4
	Listing queues ...
	hello	0
	task_queue	4
	Listing queues ...
	hello	0
	task_queue	0
	Listing queues ...


### work queue demo3 
change timeout : worker wait 1 sec, task wait 10ms


	klg@klgaliyun03:~/rabbitmq-demo/queues$  for((i=0;i<10;i+=1));do node new_task.js $i; done
	 [x] Sent '0'
	 [x] Sent '1'
	 [x] Sent '2'
	 [x] Sent '3'
	 [x] Sent '4'
	 [x] Sent '5'
	 [x] Sent '6'
	 [x] Sent '7'
	 [x] Sent '8'
	 [x] Sent '9'

	 klg@klgaliyun03:~/rabbitmq-demo/queues$ node worker.js 
	 [*] Waiting for messages in task_queue. To exit press CTRL+C
	 [x] Received 0
	 [x] Done
	 [x] Received 1
	 [x] Done
	 [x] Received 2
	 [x] Done
	 [x] Received 3
	 [x] Done
	 [x] Received 4
	 [x] Done
	 [x] Received 5
	 [x] Done
	 [x] Received 6
	 [x] Done
	 [x] Received 7
	 [x] Done
	 [x] Received 8
	 [x] Done
	 [x] Received 9
	 [x] Done
	 [x] Received 11223
	 [x] Done

	root@klgaliyun03:~#  for((i=0;i<20;i+=1));do rabbitmqctl list_queues ;  done
	Listing queues ...
	hello	0
	task_queue	7
	Listing queues ...
	hello	0
	task_queue	5
	Listing queues ...
	hello	0
	task_queue	4
	Listing queues ...
	hello	0
	task_queue	3
	Listing queues ...
	hello	0
	task_queue	2
	Listing queues ...
	hello	0
	task_queue	1
	
### publish /subscribe
![此处输入图片的描述][3]
### routing
![此处输入图片的描述][4]

    klg@klgaliyun03:~/rabbitmq-demo/routing$ node ./receive_logs_direct.js warning error
     [*] Waiting for logs. To exit press CTRL+C
     [x] error: 'Run. Run. Or it will explode.'
     [x] warning: 'warning: Run. Or it will explode.'
     [x] warning: 'warning: Run. Or it will explode.'
     [x] error: 'Run. Run. Or it will explode.'
     
     
     klg@klgaliyun03:~/rabbitmq-demo/routing$ node ./emit_log_direct.js warning "warning: Run. Or it will explode."
     [x] Sent warning: 'warning: Run. Or it will explode.'
     
     klg@klgaliyun03:~/rabbitmq-demo/routing$ node ./receive_logs_direct.js info
     [*] Waiting for logs. To exit press CTRL+C
     [x] info: 'Run. Run. Or it will explode.'
     
 
### topic
![此处输入图片的描述][5]
### RPC
[check this advance part](https://github.com/no7dw/rabbitmq-demo/blob/master/advance.md#faq)

### docker

	docker run -d -p 5671:5671 -p 5672:5672 -p 15672:15672  -p 25672:25672 -v  ~/data/rabbitmq-data/:/var/rabbitmq/lib  -e RABBITMQ_DEFAULT_USER=user -e RABBITMQ_DEFAULT_PASS=password --name my-rabbitmq rabbitmq:3-management
 

  [1]: http://www.rabbitmq.com/img/tutorials/python-one.png
  [2]: http://www.rabbitmq.com/img/tutorials/python-two.png
  [3]: http://www.rabbitmq.com/img/tutorials/exchanges.png
  [4]: http://www.rabbitmq.com/img/tutorials/python-four.png
  [5]: http://www.rabbitmq.com/img/tutorials/python-five.png