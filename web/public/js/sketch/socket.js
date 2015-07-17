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

			if (message.c == 'draw') {
				sketch && sketch.mode == 'passive' && sketch.onCommand(message.data.op);
			} else if(message.c == 'join_push') {
				if (message.data.answeringId && !info.answeringId){
					s.ws.send(JSON.stringify({
						c : 'update_connection',
						data : {
							answeringId : message.data.answeringId
						}
					}));
					info.answeringId = message.data.answeringId;
				}				
			} else if(message.c == 'upload_push') {
				$('#question').html('<img src="' + message.data.url +'"></img>');
			}
		}

		s.ws.onclose = function() { s.isConnected = false }
	}

	s.send = function(json) {
		s.ws && s.ws.send(JSON.stringify(json)); 
	}
})(socket);