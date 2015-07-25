"undefined"===typeof sketch && (sketch={});
(function(g){
	g.toolkit = {};
	g.trace = [];
	g.mode = 'passive';
	g.init = function(id, mode) {
		g.mode = mode ? mode : 'passive';
		g.canvas = document.getElementById(id);
		g.ctx = g.canvas ? g.canvas.getContext('2d') : null;
		g.canvasBg = document.getElementById('canvasBg');
		g.ctxBg = g.canvasBg ? g.canvasBg.getContext('2d') : null;
		g.strokeStyle = '#000';
		g.diameter = 2;
		g.frameInterval = 20;
		g.setToolkit('pencil');
	}

	g.registerToolkit = function (t, f) {
		g.toolkit[t] = f;
	}

	g.setToolkit = function(t) {
		g.Toolkit && g.Toolkit.isEnabled && g.Toolkit.disable();
		delete g.Toolkit;
		g.Toolkit = new g.toolkit[t]();
		g.Toolkit.enable();
	}

	g.onCommand = function(c) {
		c = parseCommand(c);

		if (c.type == 'mm') {
			//移动鼠标
			g.Toolkit && g.Toolkit.id != 'mouse' && g.setToolkit('mouse');
		} else if(c.type == 'pm') {
			g.Toolkit && g.Toolkit.id != 'pencil' && g.setToolkit('pencil');
			c.path && g.Toolkit.render(c.path);
		} else if(c.type == 'em') {
			g.Toolkit && g.Toolkit.id != 'eraser' && g.setToolkit('eraser');
			c.path && g.Toolkit.render(c.path);
		}
	}

	var parseCommand = function(c) {
		return {
			type : c[0] || 'unknow',
			path : c[1] || []
		}
	}

})(sketch);


(function(g){
	g.registerToolkit("mouse", function(){
		this.isEnabled = false;

		this.enable = function(){
			this.isEnabled = true;
		}

		this.disable = function(){
			this.isEnabled = false;
		}
	})
})(sketch);

(function(g){
	g.registerToolkit("pencil", function(){
		var pencil = this;
		this.isEnabled = false;
		pencil.path = [];
		pencil.id = 'pencil';
		pencil.keyPath = [];

		this.enable = function(){
			if (!pencil.isEnabled) {
				this.ctx = g.ctx, this.canvas = g.canvas, this.ctxBg = g.ctxBg, this.isEnabled = true;
				
				if (g.mode && g.mode == 'active') {
					pencil.canvas.onmousedown = function(e){
						pencil.isDrawingMode = true;
						pencil.ctxBg.drawImage(pencil.canvas, 0, 0);
						pencil.keyPath = [];

					}
					pencil.canvas.onmouseup = function(e) {
						pencil.isDrawingMode = false;
						pencil.ctxBg.drawImage(pencil.canvas, 0, 0);
						pencil.keyPath = [];
					}

					pencil.canvas.onmousemove =  function(e) {
						if (pencil.isDrawingMode) {
							pencil.path.push([e.offsetX, e.offsetY]);
						}
						else {
							g.trace.push([e.offsetX, e.offsetY]);
						}
					}
					pencil.frameHandle = setInterval(pencil.onFrame, g.frameInterval||20);
				}
			}
		}

		this.disable = function(){
			this.isEnabled = false;
			this.ctxBg.drawImage(this.canvas, 0, 0);
			this.ctx.clearRect(0, 0, 960, 600);
			this.keyPath = [];
			this.ctx.onmousemove = null,this.ctx.onmouseup = null,this.ctx.onmousedown = null;
			this.frameHandle && clearInterval(this.frameHandle);
		}

		// this.render = function(path){
		// 	this.ctx.save();
		// 	this.ctx.lineCap = "round";
		// 	this.ctx.lineJoin = "round";
		// 	this.ctx.lineWidth = g.diameter;
		// 	this.ctx.strokeStyle = g.strokeStyle;

		// 	for(var i = 0; i < path.length; i++){
		// 		if (i==0) this.ctx.moveTo(path[0][0], path[0][1]);
		// 		else 
		// 			this.ctx.lineTo(path[i][0], path[i][1]);
		// 	}

		// 	this.ctx.stroke();
		// 	this.ctx.restore();
		// }

		this.render = function(point){
			pencil.keyPath.push(point);
			//pencil.keyPath = pencil.keyPath.slice(-5, 5);

			this.ctx.save();
			this.ctx.lineCap = "round";
			this.ctx.lineJoin = "round";
			this.ctx.lineWidth = g.diameter;
			this.ctx.strokeStyle = g.strokeStyle;

			if (pencil.keyPath.length < 3) {
				pencil.keyPath.length == 1 && this.ctx.moveTo(pencil.keyPath[0][0], pencil.keyPath[0][1]);
				var p = pencil.keyPath[0];
				this.ctx.beginPath();
				this.ctx.arc(p[0], p[1], g.diameter/2, 0, Math.PI * 2, !0);
				this.ctx.fill();
				this.ctx.closePath();
			} else {
				this.ctx.clearRect(0, 0, 960, 600);
				this.ctx.beginPath();
				this.ctx.moveTo(pencil.keyPath[0][0], pencil.keyPath[0][1]);
				for (var i = 1; i < pencil.keyPath.length - 2; i++) {
			        var c = (pencil.keyPath[i][0] + pencil.keyPath[i + 1][0]) / 2;
			        var d = (pencil.keyPath[i][1] + pencil.keyPath[i + 1][1]) / 2;
			        this.ctx.quadraticCurveTo(pencil.keyPath[i][0], pencil.keyPath[i][1], c, d);				
				}
				
				this.ctx.quadraticCurveTo(
					pencil.keyPath[i][0],
					pencil.keyPath[i][1],
					pencil.keyPath[i + 1][0],
					pencil.keyPath[i + 1][1]
				);
		 		this.ctx.stroke();
		 		//this.ctx.closePath();
			}
	 		this.ctx.restore();
		}

		this.onFrame = function(){
			if (this.isDrawingMode || pencil.path.length > 0) {
				var buffer = [];
				for(var i=0; i<pencil.path.length && i<10; i++) {
					buffer.push(pencil.path.shift());
				}
				socket && socket.send({c:'draw', data:{op:['pm', buffer[0]],t:Date.now()}});
				pencil.render(buffer[0]);
			}

			var buffer = [];
			for(var i=0; i<g.trace.length && i<10; i++) {
				buffer.push(g.trace.shift());
			}			
			g.trace.length && socket && socket.send({c:'draw', data: {op: ['mm', buffer[0]], t: Date.now()}});
			g.trace = [];
		}

	})
})(sketch);

(function(g){
	g.registerToolkit("eraser", function(){
		var eraser = this;
		eraser.isEnabled = false;
		eraser.path = [];
		eraser.id = 'eraser';

		this.enable = function(){
			if (!this.isEnabled) {
				this.ctx = g.ctxBg, this.canvas = g.canvasBg, this.isEnabled = true;
				
				if (g.mode && g.mode == "active") {
					this.canvas.onmousedown = function(e){
						this.isDrawingMode = true;
					}
					this.canvas.onmouseup = function(e) {
						this.isDrawingMode = false;
					}

					this.canvas.onmousemove =  function(e) {
						if (this.isDrawingMode) {
							eraser.path.push([e.offsetX, e.offsetY]);
						} else {
							g.trace.push([e.offsetX, e.offsetY]);
						}
					}
					this.frameHandle = setInterval(this.onFrame, g.frameInterval||20);
				}
			}
		}

		this.disable = function(){
			this.isEnabled = false;
			this.ctx.onmousemove = null,this.ctx.onmouseup = null,this.ctx.onmousedown = null;
			this.frameHandle && clearInterval(this.frameHandle);
		}

		this.render = function(path){
			this.ctx.save();
			this.ctx.lineCap = "round";
			this.ctx.lineJoin = "round";
			this.ctx.lineWidth = 10 ;
			this.ctx.fillStyle = 'black';
			this.ctx.beginPath();
			for(var i=0;i<path.length;i++){
				if (i==0) 
					this.ctx.moveTo(path[0][0], path[0][1]);
				else 
					this.ctx.lineTo(path[i][0], path[i][1]);
			}

			this.ctx.globalCompositeOperation="destination-out";
			this.ctx.stroke();
			this.ctx.globalCompositeOperation="source-over";
			this.ctx.restore();
		}

		this.onFrame = function(){
			if (this.isDrawingMode || eraser.path.length > 0) {
				eraser.render(eraser.path);
				eraser.path.length && socket && socket.send({c:'draw', data:{op:['em', eraser.path], t:Date.now()}});
				eraser.path = [];
			}
			
			g.trace.length && socket && socket.send({c:'draw', data:{op:['mm', g.trace], t:Date.now()}});
			g.trace = [];
		}		
	})
})(sketch);
