var net = require('net');

var host = '127.0.0.1';
var port = 10002;

var client = new net.Socket();

client.connect(port, host, function () {
	console.log('connected');

	client.write(JSON.stringify({
		c : 'join',
		data : {
		    roomId : '',
		    answeringId : 'xxxx-xxxxx',
		    role : 'student',
		    username : 'tester'
		}
	}));

	client.write(JSON.stringify({
	    c : 'draw',
	    data : {
	    	roomId : 'xxxx-xxxx',
	    	answeringId : 'xxxx-xxxxx',
	    	operations : [
		        //创建画板
		        {
		            op : "createLayer",
		            id : 1212121212 //创建时的时间戳
		        },
		        //切换画板
		        {
		            op : "switchLayer",
		            index : 1  //画板索引值从0开始计数
		        }
	        ]
	    }
	}));	
});

client.on('data', function (data) {
	console.log(data);
})