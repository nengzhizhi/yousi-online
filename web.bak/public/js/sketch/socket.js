"undefined"===typeof socket && (socket = {});
(function(s){
	s.init = function(ip, port, protocol){
		s.isConnected = false;
		s.ws = new WebSocket("ws://" + ip + ":" + port, protocol);
		
		s.ws.onopen = function() {
			console.log('connect success!');

			if(info && (info.role == 'teacher' || info.role == 'student')){
				s.ws.send(JSON.stringify({c:'join',data:{
					roomId : info.roomId,
					answeringId : info.answeringId,
					role : info.role,
					username : info.username
				}}));
			}
		}

		s.ws.onmessage = function(event) {
			var message = JSON.parse(event.data);
			console.log(event.data);
			if (message.c == 'draw') {
				sketch && sketch.mode == 'passive' && sketch.onCommand(message.data.op);
			} else if(message.c == 'join_push') {
				console.log('message.data.username = ' + message.data.username);
				if (message.data.username != info.username) {
					appendLog('[' + message.data.username + ']加入房间');
				}
				setAnsweringStatus('answering');		
			} else if(message.c == 'upload_push') {
				$('#question').html('<img src="' + message.data.url +'"></img>');
			} else if(message.c == 'leave_push') {
				appendLog('[' + message.data.username + ']离开房间');
			}
		}

		s.ws.onclose = function() { s.isConnected = false }
	}

	s.send = function(json) {
		s.ws && s.ws.send(JSON.stringify(json)); 
	}
})(socket);