"undefined"===typeof sketch && (sketch={});
(function(g){
	g.toolkit = {};
	g.trace = [];
	g.mode = 'passive';
	g.init = function(id, mode) {
		g.dom = document.getElementById(id);
		g.mode = mode ? mode : 'passive';
		g.canvasArray = [] 
		g.canvasArray.push(new YSCanvas(g.dom,g.canvasArray.length + 1))
		g.currentIndex = 0
		g.canvas =  g.canvasArray ? g.canvasArray[g.currentIndex].getWriteCanvas() : null;
		g.ctx = g.canvasArray ? g.canvasArray[g.currentIndex].getWrite() : null;
		g.fctx = g.canvasArray ? g.canvasArray[g.currentIndex].getShape() : null;
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
			if (!pencil.isEnabled) {
				this.ctx = g.ctx, this.canvas = g.canvas, this.isEnabled = true;
				
				if (g.mode && g.mode == 'active') {
					this.dom = g.dom
					console.log(this.dom)
					this.dom.onmousedown = function(e){
						pencil.isDrawingMode = true;
					}
					this.dom.onmouseup = function(e) {
						pencil.isDrawingMode = false;
						pencil.path = []
					}

					this.dom.onmousemove =  function(e) {
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
			this.dom.onmousemove = null,this.dom.onmouseup = null,this.dom.onmousedown = null;
			this.frameHandle && clearInterval(this.frameHandle);
		}
		this.render = function(path){
			this.ctx.save();
			console.log(JSON.stringify(path))
			this.ctx.lineCap = "round";
			this.ctx.lineJoin = "round";
			this.ctx.lineWidth = g.diameter;
			this.ctx.strokeStyle = g.strokeStyle;
			if (path.length < 3) {
		        var b = path[0];
		        this.ctx.beginPath();
		        this.ctx.arc(b[0], b[1], g.diameter/2 , 0, Math.PI * 2, !0);
		        this.ctx.fill();
		        this.ctx.closePath();
		        return;
		    }
		    this.ctx.clearRect(0, 0, g.canvasArray[g.currentIndex].canvasWidth, g.canvasArray[g.currentIndex].canvasHeight);
		    this.ctx.beginPath();
		    this.ctx.moveTo(path[0][0], path[0][1]);
		    for (var i = 1; i < path.length - 2; i++) {
		        var c = (path[i][0] + path[i + 1][0]) / 2;
		        var d = (path[i][1] + path[i + 1][1]) / 2;
		        this.ctx.quadraticCurveTo(path[i][0], path[i][1], c, d);
		    }
		    // For the last 2 points
		    this.ctx.quadraticCurveTo(
		        path[i][0],
		        path[i][1],
		        path[i + 1][0],
		        path[i + 1][1]
		    );
		    this.ctx.stroke();
			this.ctx.restore
   //  		this.ctx.beginPath()
			// this.ctx.moveTo(50, 100);
			// this.ctx.quadraticCurveTo(60, 200,100, 60);
			// this.ctx.stroke();
			
		}
		this.onFrame = function(){
			if (this.isDrawingMode || pencil.path.length > 0) {
				// var buffer = [];
				// for(var i=0; i<pencil.path.length && i<10; i++) {
				// 	buffer.push(pencil.path.shift());
				// }
				pencil.render(pencil.path);
				//socket && socket.send({c:'draw', data:{op:['pm', buffer],t:Date.now()}});
				socket && socket.send({c:'draw', data:{op:['pm', [pencil.path[0]]],t:Date.now()}});
				
			}
			g.trace.length && socket && socket.send({c:'draw', data:{op:['mm', g.trace], t:Date.now()}});
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
				if (g.mode && g.mode == "active") {
					this.dom = g.dom
					this.ctx = g.ctx, this.canvas = g.canvas, this.isEnabled = true;
					this.dom.onmousedown = function(e){
						this.isDrawingMode = true;
					}
					this.dom.onmouseup = function(e) {
						this.isDrawingMode = false;
					}
					this.dom.onmousemove =  function(e) {
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
			this.dom.onmousemove = null,this.dom.onmouseup = null,this.dom.onmousedown = null;
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


(function(g){
	g.registerToolkit("rectangle", function(){
		var rectangle = this;
		rectangle.isEnabled = false;
		rectangle.path = [];
		rectangle.id = 'rectangle';
		this.enable = function(){
			if (!this.isEnabled) {
				this.dom = g.dom
				this.isEnabled = true;
				this.dom.onmousedown = function(e){
					this.isDrawingMode = true;
					rectangle.path.push({x:e.offsetX, y:e.offsetY});
					var rect = new fabric.Rect({
			            id:Date.now(),
			            width:0,
			            height:0,
			            left:rectangle.path[0].x,
			            top:rectangle.path[0].y,
			            angle:0,
			            fill:g.fillStyle,
			            stroke:g.strokeStyle,
			            strokeWidth:g.diameter,
			            scaleX:1,
			            scaleY:1,
			            selectable:true
			        });
			        g.fctx.add(rect);
			        g.fctx.setActiveObject(rect);
				}
				this.dom.onmouseup = function(e) {
					this.isDrawingMode = false;
					rectangle.path = []
				}
				this.dom.onmousemove =  function(e) {
					if (this.isDrawingMode) {
						rectangle.path.push({x:e.offsetX, y:e.offsetY});
					} else {
						g.trace.push({x:e.offsetX, y:e.offsetY});
					}
				}
				this.frameHandle = setInterval(this.onFrame, g.frameInterval||20);

			}
		}

		this.disable = function(){
			this.isEnabled = false;
			this.dom.onmousemove = null,this.dom.onmouseup = null,this.dom.onmousedown = null;
			this.frameHandle && clearInterval(this.frameHandle);
		}

		this.render = function(path){
			var _endPoint = rectangle.path[rectangle.path.length-1],
            _startPoint = rectangle.path[0],
            _width = _endPoint.x- _startPoint.x,
            _height = _endPoint.y - _startPoint.y,
            _rect = g.fctx.getActiveObject();
            _rect.set('width',_width).set('height',_height).set('originX','center').set('originY','center');
            _rect.setCoords();
            g.fctx.renderAll();
		}

		this.onFrame = function(){
			if (this.isDrawingMode || rectangle.path.length > 0) {
				rectangle.render(rectangle.path);
				rectangle.path.length && socket && socket.send(JSON.stringify({c:'draw', data:['rm', eraser.path, Date.now()]}));
				
			}
			g.trace.length && socket && socket.send(JSON.stringify({c:'draw', data:['mm', g.trace, Date.now()]}));
			g.trace = [];
		}		
	})
})(sketch);

(function(g){
	g.registerToolkit("circle", function(){

		var circle = this;
		circle.isEnabled = false;
		circle.path = [];
		circle.id = 'circle';

		this.enable = function(){
			if (!this.isEnabled) {
				this.dom = g.dom
				this.isEnabled = true;

				this.dom.onmousedown = function(e){
					this.isDrawingMode = true;
					circle.path.push({x:e.offsetX, y:e.offsetY});
					console.log("circle")
					var _circle = new fabric.Circle({
			            id:Date.now(),
			            width:0,
			            height:0,
			            radius:0,
			            left:circle.path[0].x,
			            top:circle.path[0].y,
			            angle:0,
			            fill:g.fillStyle,
			            stroke:g.strokeStyle,
			            strokeWidth:g.diameter,
			            scaleX:1,
			            scaleY:1,
			            originX:"center",
			            originY:"center"
			            
			        });
			        g.fctx.add(_circle);
			        g.fctx.setActiveObject(_circle);
				}

				this.dom.onmouseup = function(e) {
					this.isDrawingMode = false;
					circle.path = []

				}

				this.dom.onmousemove =  function(e) {
					
					if (this.isDrawingMode) {
						circle.path.push({x:e.offsetX, y:e.offsetY});
					} else {
						g.trace.push({x:e.offsetX, y:e.offsetY});
					}
				}
				this.frameHandle = setInterval(this.onFrame, g.frameInterval||20);

			}
		}

		this.disable = function(){
			this.isEnabled = false;
			this.dom.onmousemove = null,this.dom.onmouseup = null,this.dom.onmousedown = null;
			this.frameHandle && clearInterval(this.frameHandle);
		}

		this.render = function(path){
			
			 var _endPoint = circle.path[circle.path.length-1],
            _startPoint = circle.path[0],
            _width = _endPoint.x - _startPoint.x,
            _height = _endPoint.y - _startPoint.y,
            _radius = Math.pow((_width*_width+_height*_height),0.5);
            _circle = g.fctx.getActiveObject();
            _circle.set('radius',_radius);
            _circle.setCoords();
            g.fctx.renderAll();
		}

		this.onFrame = function(){

			if (this.isDrawingMode || circle.path.length > 0) {
				circle.render(circle.path);
				circle.path.length && socket && socket.send(JSON.stringify({c:'draw', data:['cm', circle.path, Date.now()]}));
				
			}
			
			g.trace.length && socket && socket.send(JSON.stringify({c:'draw', data:['mm', g.trace, Date.now()]}));
			g.trace = [];
		}		
	})
})(sketch);


(function(g){
	g.registerToolkit("triangle", function(){

		var triangle = this;
		triangle.isEnabled = false;
		triangle.path = [];
		triangle.id = 'triangle';

		this.enable = function(){
			if (!this.isEnabled) {
				this.dom = g.dom
				this.isEnabled = true;

				this.dom.onmousedown = function(e){
					this.isDrawingMode = true;
					triangle.path.push({x:e.offsetX, y:e.offsetY});
					var _triangle = new fabric.Triangle({
			            id:Date.now(),
			            radius:0,
			            left:triangle.path[0].x,
			            top:triangle.path[0].y,
			            fill:g.fillStyle ,
			            stroke:g.strokeStyle,
			            strokeWidth:g.diameter,
			            width:0,
            			height:0,
			            scaleX:1,
			            scaleY:1,
			            originX :'center',
            			originY :'center'
			        });
			        _triangle.set('width',0).set('height',0);
			        g.fctx.add(_triangle);
			        g.fctx.setActiveObject(_triangle);
				}

				this.dom.onmouseup = function(e) {
					this.isDrawingMode = false;
					triangle.path = []

				}

				this.dom.onmousemove =  function(e) {
					
					if (this.isDrawingMode) {
						triangle.path.push({x:e.offsetX, y:e.offsetY});
					} else {
						g.trace.push({x:e.offsetX, y:e.offsetY});
					}
				}
				this.frameHandle = setInterval(this.onFrame, g.frameInterval||20);

			}
		}

		this.disable = function(){
			this.isEnabled = false;
			this.dom.onmousemove = null,this.dom.onmouseup = null,this.dom.onmousedown = null;
			this.frameHandle && clearInterval(this.frameHandle);
		}

		this.render = function(path){
			// console.log(triangle.path.length)
			 var _endPoint = triangle.path[triangle.path.length-1],
            _startPoint = triangle.path[0],
            _width = _endPoint.x - _startPoint.x,
            _height = _endPoint.y - _startPoint.y,
            _triangle = g.fctx.getActiveObject();
            _triangle.set('width',_width).set('height',_height).set('originX','center').set('originY','center');
            _triangle.setCoords();
            g.fctx.renderAll();

		}

		this.onFrame = function(){

			if (this.isDrawingMode || triangle.path.length > 0) {
				triangle.render(triangle.path);
				triangle.path.length && socket && socket.send(JSON.stringify({c:'draw', data:['tm', triangle.path, Date.now()]}));
				
			}
			
			g.trace.length && socket && socket.send(JSON.stringify({c:'draw', data:['mm', g.trace, Date.now()]}));
			g.trace = [];
		}		
	})
})(sketch);

(function(g){
	g.registerToolkit("line", function(){

		var line = this;
		line.isEnabled = false;
		line.path = [];
		line.id = 'line';

		this.enable = function(){
			if (!this.isEnabled) {
				this.dom = g.dom
				this.isEnabled = true;

				this.dom.onmousedown = function(e){
					this.isDrawingMode = true;
					line.path.push({x:e.offsetX, y:e.offsetY});
					var points = [line.path[0].x,line.path[0].y,line.path[0].x,line.path[0].y]
					var _line = new fabric.Line(points,{
			            id: Date.now(),
			            fill:g.fillStyle,
			            stroke:g.strokeStyle,
			            strokeWidth:g.diameter,
			            scaleX:1,
			            scaleY:1
			        });
			        _line.set('width',0).set('height',0);
			        g.fctx.add(_line);
			        g.fctx.setActiveObject(_line);
				}

				this.dom.onmouseup = function(e) {
					this.isDrawingMode = false;
					line.path = []

				}

				this.dom.onmousemove =  function(e) {
					console.log("aaaaasssssssss")
					if (this.isDrawingMode) {
						line.path.push({x:e.offsetX, y:e.offsetY});
					} else {
						g.trace.push({x:e.offsetX, y:e.offsetY});
					}
				}
				this.frameHandle = setInterval(this.onFrame, g.frameInterval||20);

			}
		}

		this.disable = function(){
			this.isEnabled = false;
			this.dom.onmousemove = null,this.dom.onmouseup = null,this.dom.onmousedown = null;
			this.frameHandle && clearInterval(this.frameHandle);
		}

		this.render = function(path){
			// console.log(triangle.path.length)
			var _endPoint = line.path[line.path.length-1],
            _line = g.fctx.getActiveObject();
            _line.set('x2',_endPoint.x).set('y2',_endPoint.y).set('originX','center').set('originY','center');
            _line.setCoords();
            g.fctx.renderAll();

		}

		this.onFrame = function(){

			if (this.isDrawingMode || line.path.length > 0) {
				line.render(line.path);
				line.path.length && socket && socket.send(JSON.stringify({c:'draw', data:['lm', line.path, Date.now()]}));
				
			}
			
			g.trace.length && socket && socket.send(JSON.stringify({c:'draw', data:['mm', g.trace, Date.now()]}));
			g.trace = [];
		}		
	})
})(sketch);