"undefined"===typeof replay&&(replay={});
(function(r){
	r.ops = [];
	r.frameInterval = 20;
	r.offset = 0;
	r.blockSize = 10000;

	r.start = function(){
		r.getOps();
	}

	r.stop = function(){
		clearInterval(r.frameHandle);
	}

	r.getOps = function(data, callback){
		$.ajax({
			type : 'POST',
			url : 'http://localhost/api/answering/getOperations',
			success : function(data) {
				if (data.code != 200 || data.data.length <= 0) {
					r.stop();
				} else {
					r.offset += data.data.length;
					r.ops.length == 0 ? r.ops = data.data : r.ops.concat(data.data);
					r.frameHandle = setInterval(r.frameHandle, r.frameInterval);
				}
			},
			error : function(){
				r.stop();
			},
			data : {
				answeringId : info.answeringId,
				start : r.offset,
				count : r.blockSize || 10000
			},
			dataType : 'json'
		})
	}

	r.frameHandle = function(){
		var op = r.getOp();
		op ? sketch && sketch.onCommand(op.op) : r.stop();
	}
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