"undefined"===typeof sketch && (sketch={});
(function(g){
	g.toolkit = {};
	g.trace = [];
	g.init = function(id) {
		g.canvas = document.getElementById(id);
		g.ctx = g.canvas ? g.canvas.getContext('2d') : null;
		g.strokeStyle = '#000';
		g.diameter = 2;
		g.setToolkit('pencil');
		g.frameInterval = 20;
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
		c= parseCommand(c);

		if (c.type == 'mm') {
			//移动鼠标
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
			path : c[1] || [],
			timestamp : c[2] || !1
		}
	}

})(sketch);

(function(g){
	g.registerToolkit("pencil", function(){
		var pencil = this;
		this.isEnabled = false;
		pencil.path = [];
		pencil.id = 'pencil';

		this.enable = function(){
			if (!this.isEnabled) {
				this.ctx = g.ctx;
				this.canvas = g.canvas;
				this.isEnabled = true;

				this.canvas.onmousedown = function(e){
					this.isDrawingMode = true;
				}
				this.canvas.onmouseup = function(e) {
					this.isDrawingMode = false;
				}

				this.canvas.onmousemove =  function(e) {
					if (this.isDrawingMode) {
						pencil.path.push({x:e.offsetX, y:e.offsetY});
					}
					else {
						g.trace.push({x:e.offsetX, y:e.offsetY});
					}
				}
				this.frameHandle = setInterval(this.onFrame, g.frameInterval||20);
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
			this.ctx.lineWidth = g.diameter;
			this.ctx.strokeStyle = g.strokeStyle;
			for(var i = 0; i < path.length; i++){
				if (i==0) this.ctx.moveTo(path[0].x, path[0].y);
				else 
					this.ctx.lineTo(path[i].x, path[i].y);
			}

			this.ctx.stroke();
			this.ctx.restore();
		}

		this.onFrame = function(){
			if (this.isDrawingMode || pencil.path.length > 0) {
				pencil.render(pencil.path);
				pencil.path.length && socket && socket.send(JSON.stringify({c:'draw', data:['pm', pencil.path, Date.now()]}));
				pencil.path = [];
			}
			g.trace.length && socket && socket.send(JSON.stringify({c:'draw', data:['mm', g.trace, Date.now()]}));
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
				this.ctx = g.ctx;
				this.canvas = g.canvas;
				this.isEnabled = true;

				this.canvas.onmousedown = function(e){
					this.isDrawingMode = true;
				}
				this.canvas.onmouseup = function(e) {
					this.isDrawingMode = false;
				}

				this.canvas.onmousemove =  function(e) {
					if (this.isDrawingMode) {
						eraser.path.push({x:e.offsetX, y:e.offsetY});
					} else {
						g.trace.push({x:e.offsetX, y:e.offsetY});
					}
				}
				this.frameHandle = setInterval(this.onFrame, g.frameInterval||20);
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
					this.ctx.moveTo(path[0].x, path[0].y);
				else 
					this.ctx.lineTo(path[i].x, path[i].y);
			}

			this.ctx.globalCompositeOperation="destination-out";
			this.ctx.stroke();
			this.ctx.globalCompositeOperation="source-over";
			this.ctx.restore();
		}

		this.onFrame = function(){
			if (this.isDrawingMode || eraser.path.length > 0) {
				eraser.render(eraser.path);
				eraser.path.length && socket && socket.send(JSON.stringify({c:'draw', data:['em', eraser.path, Date.now()]}));
				eraser.path = [];
			}
			
			g.trace.length && socket && socket.send(JSON.stringify({c:'draw', data:['mm', g.trace, Date.now()]}));
			g.trace = [];
		}		
	})
})(sketch);