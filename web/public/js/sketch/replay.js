"undefined"===typeof replay&&(replay={});
(function(r){
	r.ops = [];
	r.frameInterval = 20;
	r.offset = 0;
	r.blockSize = 30000;
	r.audioURL = ""
	r.index = 0

	r.start = function(){
		console.log("aaaaaaaaaa")
		r.getStart();
	}

	r.stop = function(){
		clearInterval(r.frameHandle);
	}

	r.getStart = function(data, callback){
		console.log("answeringId:",info.answeringId)
		$.ajax({
			type : 'POST',
			url : 'http://121.40.174.3/api/answering/getOperations',
			success : function(data) {
				console.log("getOperations:",JSON.stringify(data))
				if (data.code != 200 ) {
					r.stop();
				} else {

					r.offset += data.data.length;
					r.ops.length == 0 ? r.ops = data.data : r.ops.concat(data.data);
					r.getOps()
				}
			},
			error : function(){
				r.stop();
			},
			data : {
				answeringId : info.answeringId,
				start : r.offset,
				count : r.blockSize || 30000
			},
			dataType : 'json'
		})
	}

	r.getOps = function(){
		$.ajax({
			type : 'POST',
			url : 'http://121.40.174.3/api/answering/getAnswering',
			success : function(data) {
				console.log("getAnswering:",JSON.stringify(data))
				if (data.code != 200) {
					r.stop();
				} else {
					r.audioURL = data.data.audio
					console.log("r.audio:",data.data.audio)
					console.log("r.audioURL:",r.audioURL)
					audio.callback = function(){
						var op = r.getOp();
						r.index++ 
						console.log("index:",r.index)
						op ? sketch && sketch.onCommand(op.op) : audio.actions.pause()
					}
					audio.playWithURL(r.audioURL)
					
				}
			},
			error : function(){
				r.stop();
			},
			data : {
				id : info.answeringId
			},
			dataType : 'json'
		})
	}

	// r.frameHandle = function(){
	// 	var op = r.getOp();

	// 	op ? sketch && sketch.onCommand(op.op) : r.stop();
	// }
	// //var before = Date.now(),leftValue = 0;
	// r.frameHandle = function(){
	// 	//var now = Date.now();
	// 	//var elapsedTime = now - before;

	// 	// if (elapsedTime > r.frameInterval) {
	// 	// 	leftValue += Math.floor(elapsedTime/r.frameInterval);
	// 	// 	for (var i = 0; i < leftValue; i++) {
	// 	// 		var op = r.getOp();
	// 	// 		op ? sketch && sketch.onCommand(op.op) : r.stop();
	// 	// 	}
	// 	// 	leftValue = 0;
	// 	// }
	// 	// else {
	// 	// 	leftValue ++;
	// 	// }
	// 	// before = Date.now();
	// }

	r.getOp = function(){
		return r.ops.length ? r.ops.shift() : null;
	}
})(replay);