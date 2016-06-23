# rabbitmq-demo

### demo

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

#### list_queues again

	klg@klgaliyun03:~/demo$ sudo rabbitmqctl list_queues
	[sudo] password for klg: 
	Listing queues ...
	hello	0


### demo2	

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


### demo3 
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