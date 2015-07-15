var YSSocket = function(){
	this.isConnect = false
	this.ws = null
	this.init()
}

YSSocket.prototype.init = function(){
	var socket = this;
	this.ws = new WebSocket("ws://112.124.117.146:10001",'echo-protocol');
	this.ws.onopen = function(){
		console.log("connected")
		socket.isConnect = true

		if ( para.identify == Identify.teacher ) {
			socket.sendJSONString({
   				c : 'join',
			    data : {
			        roomId : 'xxxx-xxxx',
			        answeringId : 'xxxx-xxxx-xxxx-xxxx',
			        role : 'teacher',
			        username : 'tester'
			    }
			})
		}else{
			socket.sendJSONString({
			    c : 'join',
			    data : {
			        roomId : 'xxxx-xxxx',
			        answeringId : 'xxxx-xxxx-xxxx-xxxx',
			        role : 'student',
			        username : 'tester'
			    }
			})
		}
	}
}


YSSocket.prototype.receieve = function(callback){
	this.ws.onmessage = function (event)
    {
    	var receieve = event.data;
    	callback(JSON.parse(receieve))
    };
}

YSSocket.prototype.close = function(callback){
	this.ws.onclose = function(){
		console.log("disconnect")
		callback()
	}
}

YSSocket.prototype.sendJSONString = function(data){
	if (this.isConnect == true){
		console.log("send json:",data)
		this.ws.send(JSON.stringify(data));
	}
}

YSSocket.prototype.send = function(data){
	if (this.isConnect == true){
		this.ws.send(data);
	}
}

var socket = (function () {
	var value = undefined;
	var func2 = (function () {
		if (value === undefined) {
			value = new YSSocket();
		}
		return value;
	})()
	return func2;
})()
