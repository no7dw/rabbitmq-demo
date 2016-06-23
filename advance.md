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

### why lost message?

### config advarnce  	
#### limit speed


#### give a warning


  [1]: http://7xk67t.com1.z0.glb.clouddn.com/init.jpg
  [2]: http://7xk67t.com1.z0.glb.clouddn.com/graph.jpg
