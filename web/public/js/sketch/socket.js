"undefined"===typeof socket && (socket = {});
(function(s){
	s.init = function(ip, port, protocol){
		s.ws = new WebSocket("ws://" + ip + ":" + port, protocol);
		s.ws.onopen = function() {
			s.isConnected = true && console.log('connect success!');
		}

		s.ws.onmessage = function(event) {
			var message = JSON.parse(event.data);
			if (message.c == 'draw') {
				sketch && sketch.onCommand(message.data);
			} else if(message.c == 'join') {

			}
		}

		s.ws.onclose = function() { s.isConnected = false }
	}

	s.send = function(data) {
		s.ws && s.ws.send(data); 
	}
})(socket);