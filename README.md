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
	
