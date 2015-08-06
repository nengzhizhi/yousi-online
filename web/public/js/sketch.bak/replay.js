"undefined"===typeof replay&&(replay={});
(function(r){
	r.ops = [];
	r.frameInterval = 20;
	r.offset = 0;
	r.blockSize = 30000;
	r.audioURL = ""
	r.baseTime = 0

	r.start = function(){
		r.getStart();
	}

	r.stop = function(){
		clearInterval(r.frameHandle);
	}

	r.getStart = function(data, callback){
		console.log("answeringId:",info.answeringId)
		$.ajax({
			type : 'POST',
			url : '/api/answering/getOperations',
			success : function(data) {
				console.log("getOperations:",JSON.stringify(data))
				if (data.code != 200 ) {
					r.stop();
				} else {
					r.offset += data.data.length;
					r.ops.length == 0 ? r.ops = data.data : r.ops.concat(data.data);
					if (r.ops.length > 0 ) {
						var newOp = r.ops[0]
						r.baseTime = newOp.t
						console.log("r.baseTime",r.baseTime)
					}
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
			url : '/api/answering/getAnswering',
			success : function(data) {
				console.log("getAnswering:",JSON.stringify(data))
				if (data.code != 200) {
					r.stop();
				} else {
					r.audioURL = data.data.audio
					audio.callback = function(time){
						var nowOps = r.getCanOps(time)
						for (var i = 0; i < nowOps.length; i++) {
							var next = nowOps[i]
							console.log(JSON.stringify(nowOps[i]))
							next.op ? sketch && sketch.onCommand(next.op) : audio.actions.pause()
						};
						
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

	r.getCanOps = function(time){
		var lists = []
		if (r.ops.length > 0) {
			for (var i = 0; i < r.ops.length; i++) {
				var newOp = r.ops[i]
				var timesamp = newOp.t - r.baseTime
				if (timesamp < time) {
					lists.push(r.ops.shift())
				}else{
					break;
				}
			};
		}
		return lists
	}

	r.getOp = function(){
		return r.ops.length ? r.ops.shift() : null;
	}
})(replay);