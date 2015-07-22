"undefined"===typeof sketch && (sketch={});
(function(g){
	g.toolkit = {};
	g.trace = [];
	g.mode = 'passive';
	g.init = function(id, mode) {
		g.dom = document.getElementById(id);
		g.ctn = ""
		g.mode = mode ? mode : 'passive';
		g.canvasArray = [] 
		g.canvasArray.push(new YSCanvas(g.dom,g.canvasArray.length + 1))
		g.currentIndex = 0
		g.canvas =  g.canvasArray ? g.canvasArray[g.currentIndex].getWriteCanvas() : null;
		g.ctx = g.canvasArray ? g.canvasArray[g.currentIndex].getWrite() : null;
		g.fctx = g.canvasArray ? g.canvasArray[g.currentIndex].getShape() : null;
		g.tid = 0
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
		this.ctx = g.ctx
		pencil.keyPath = []
		// g.canvas =  g.canvasArray ? g.canvasArray[g.currentIndex].getWriteCanvas() : null;
		// g.ctx = g.canvasArray ? g.canvasArray[g.currentIndex].getWrite() : null;
		this.enable = function(){
			if (!pencil.isEnabled) {
				// this.ctx = g.ctx, this.canvas = g.canvas, this.isEnabled = true;
				if (g.mode && g.mode == 'active') {
					this.dom = g.dom
					this.dom.onmousedown = function(e){
						pencil.isDrawingMode = true;
						g.canvasArray[g.currentIndex].getDown().drawImage(g.canvas, 0, 0);
						pencil.keyPath = [];
					}
					this.dom.onmouseup = function(e) {
						pencil.isDrawingMode = false;
						g.canvasArray[g.currentIndex].getDown().drawImage(g.canvas, 0, 0);
						pencil.keyPath = [];
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
			g.canvasArray[g.currentIndex].getDown().drawImage(g.canvas, 0, 0);
			this.ctx.clearRect(0,0,960,600)
			pencil.keyPath = []
			this.dom.onmousemove = null,this.dom.onmouseup = null,this.dom.onmousedown = null;
			this.frameHandle && clearInterval(this.frameHandle);
		}
		//bgctx = getdown
		//ctx = getwrite
		//pencil.canvas = getWriteCanvas
		this.render = function(point){

			pencil.keyPath.push(point);
			
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
				eraser.path.length && socket && socket.send({c:'draw', data:{op:['em', eraser.path[eraser.path.length-1]], t:Date.now()}});
				eraser.path = [];
			}
			g.trace.length && socket && socket.send({c:'draw', data:{op:['mm', g.trace[0]], t:Date.now()}});
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
					rectangle.path.push([e.offsetX, e.offsetY]);
					g.tid = Date.now()
					var rect = new fabric.Rect({
			            id:g.tid,
			            width:0,
			            height:0,
			            left:rectangle.path[0][0],
			            top:rectangle.path[0][1],
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
						rectangle.path.push([e.offsetX, e.offsetY]);
					} else {
						g.trace.push([e.offsetX, e.offsetY]);
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
            _width = _endPoint[0] - _startPoint[0],
            _height = _endPoint[1] - _startPoint[1],
            _rect = g.fctx.getActiveObject();
            _rect.set('width',_width).set('height',_height).set('originX','center').set('originY','center');
            _rect.setCoords();
            g.fctx.renderAll();
		}

		this.onFrame = function(){
			if (this.isDrawingMode || rectangle.path.length > 0) {
				rectangle.render(rectangle.path);
				rectangle.path.length && socket && socket.send({c:'draw', data:{op:['rm', rectangle.path[rectangle.path.length-1], g.tid],t:Date.now()}});
			}
			g.trace.length && socket && socket.send({c:'draw', data:{op:['mm', g.trace[0], Date.now()],t:Date.now()}});
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
					circle.path.push([e.offsetX, e.offsetY]);
					console.log("circle")
					g.tid =  Date.now()
					var _circle = new fabric.Circle({
			            id:g.tid,
			            width:0,
			            height:0,
			            radius:0,
			            left:circle.path[0][0],
			            top:circle.path[0][1],
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
						circle.path.push([e.offsetX, e.offsetY]);
					} else {
						g.trace.push([e.offsetX, e.offsetY]);
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
            _width = _endPoint[0] - _startPoint[0],
            _height = _endPoint[1] - _startPoint[1],
            _radius = Math.pow((_width*_width+_height*_height),0.5);
            _circle = g.fctx.getActiveObject();
            _circle.set('radius',_radius);
            _circle.setCoords();
            g.fctx.renderAll();
		}

		this.onFrame = function(){

			if (this.isDrawingMode || circle.path.length > 0) {
				circle.render(circle.path);
				circle.path.length && socket && socket.send({c:'draw', data:{op:['cm', circle.path[circle.path.length-1], g.tid],t:Date.now()}});
				
			}
			
			g.trace.length && socket && socket.send({c:'draw', data:{op:['mm', g.trace[0], Date.now()],t:Date.now()}});
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
					g.tid = Date.now()
					triangle.path.push([e.offsetX, e.offsetY]);
					var _triangle = new fabric.Triangle({
			            id:g.tid,
			            radius:0,
			            left:triangle.path[0][0],
			            top:triangle.path[0][1],
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
						triangle.path.push([e.offsetX, e.offsetY]);
					} else {
						g.trace.push([e.offsetX, e.offsetY]);
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
            _width = _endPoint[0] - _startPoint[0],
            _height = _endPoint[1] - _startPoint[1],
            _triangle = g.fctx.getActiveObject();
            console.log(_width,_height)
            _triangle.set('width',_width).set('height',_height).set('originX','center').set('originY','center');
            _triangle.setCoords();
            g.fctx.renderAll();

		}

		this.onFrame = function(){

			if (this.isDrawingMode || triangle.path.length > 0) {
				triangle.render(triangle.path);
				triangle.path.length && socket && socket.send({c:'draw', data:{op:['tm', triangle.path[triangle.path.length-1], g.tid],t:Date.now()}});
			}
			g.trace.length && socket && socket.send({c:'draw', data:['mm', g.trace[0], Date.now()]});
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
					line.path.push([e.offsetX, e.offsetY]);
					var points = [line.path[0][0],line.path[0][1],line.path[0][0],line.path[0][1]]
					g.tid = Date.now()
					var _line = new fabric.Line(points,{
			            id: g.tid,
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
						line.path.push([e.offsetX, e.offsetY]);
					} else {
						g.trace.push([e.offsetX, e.offsetY]);
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
            _line.set('x2',_endPoint[0]).set('y2',_endPoint[1]).set('originX','center').set('originY','center');
            _line.setCoords();
            g.fctx.renderAll();
		}

		this.onFrame = function(){

			if (this.isDrawingMode || line.path.length > 0) {
				line.render(line.path);
				line.path.length && socket && socket.send({c:'draw', data:{op:['lm', line.path[line.path.length-1], g.tid],t:Date.now()}});
				
			}
			
			g.trace.length && socket && socket.send({c:'draw', data:['mm', g.trace, Date.now()]});
			g.trace = [];
		}		
	})
})(sketch);

(function(g){
	g.registerToolkit("image", function(){
		var image = this;
		image.isEnabled = false;
		image.path = [];
		image.id = 'image';
		this.enable = function(){
			if (!this.isEnabled) {
				this.dom = g.dom
				this.isEnabled = true;
				this.dom.onmousedown = function(e){
					this.ctx.selection=true;
				    var _point = [e.offsetX,e.offsetY];
				    var _imageUrl = g.ctn;
				    if(!_imageUrl || _imageUrl == '') return;
				    var img = new Image();
				    img.src = _imageUrl;
				    img.onload = function(){
				        var _img = new fabric.Image(img,{
				            id:Date.now(),
				            radius:0,
				            left:_point[0],
				            top:_point[0],
				            scaleX:1,
				            scaleY:1,
				            originX :'center',
				            originY :'center',
				            selectable:false
				        });
				        context.add(_img);

				        
				    }
				}
			}
		}

		this.disable = function(){
			this.isEnabled = false;
			this.dom.onmousemove = null,this.dom.onmouseup = null,this.dom.onmousedown = null;
		}

		
	})
})(sketch);

(function(g){
	g.registerToolkit("move", function(){
		var image = this;
		this.dom = g.dom
		image.isEnabled = true;
		image.path = [];
		image.id = 'move';
		this.enable = function(){
			$('.canvas-container').css('z-index',10)
	        g.canvasArray[g.currentIndex].getShape().selection=true;
	        var objs = g.canvasArray[g.currentIndex].getShape();
	        var _objs = objs.toObject();
	        var objects = _objs.objects;
	        for(var i=0;i<objects.length;i++){
	            (objs.item(i)).set('selectable',true)
	        }
		}

		this.dom.onmousemove = function(e){
			g.trace.push([e.offsetX,e.offsetY])
		}

		this.disable = function(){
			$('.canvas-container').css('z-index',6)
	        g.canvasArray[g.currentIndex].getShape().selection=false;
	        var objs = g.canvasArray[g.currentIndex].getShape();
	        var _objs = objs.toObject();
	        var objects = _objs.objects;
	        for(var i=0;i<objects.length;i++){
	            (objs.item(i)).set('selectable',false)
	        }
	        this.dom.onmousemove = null
		}

		this.frameHandle = setInterval(this.onFrame, g.frameInterval||20);
		this.onFrame = function(){
			g.trace.length && socket && socket.send(JSON.stringify({c:'draw', data:['mm', g.trace, Date.now()]}));
			g.trace = [];
		}	
	})
})(sketch);


(function(g){
	g.registerToolkit("font", function(){
		var font = this;
		this.dom = g.dom
		font.isEnabled = true;
		font.path = [];
		font.id = 'font';
		font.parentOffset = $("canvas").offset();
		this.enable = function(){
			font.isEnabled = true;
			
			$("#createText").click(function(){
				font.render($("#fillTxt").val())
			})
			$("#cancelText").click(function(){
				font.hidden()
			})
		}
		this.dom.onmousedown = function(e){
			console.log(font.parentOffset.left)
			console.log(font.parentOffset.top)
			if (!$('#fillTxtdiv').is(":visible")){
				font.path.push([e.offsetX,e.offsetY])
				font.show()
			}
		}
		this.show = function(){
			font.path.length > 1 && font.path.shift()
			$('#fillTxtdiv').css({
	 			'left':font.path[0][0],
	            'top':font.path[0][1],
	            'width':200,
	            'height':100
	        }).show();
        	$('#fillTxt').show().focus();
		}
		this.hidden = function(){
			$('#fillTxt').val('');
			$('#fillTxtdiv').hide()
		}
		this.dom.onmousemove = function(e){
			g.trace.push([e.offsetX,e.offsetY])
		}
		this.render = function(ctn){
			g.tid = Date.now()
			var point = font.path[0]
			g.ctn = ctn
			var _text = new fabric.Text(g.ctn,{
		        id:g.tid,
		        radius:0,
		        left:point[0],
		        top:point[1],
		        fill:g.fillStyle,
		        stroke:g.strokeStyle,
		        strokeWidth:g.diameter,
		        scaleX:1,
		        scaleY:1,
		        originX :'center',
		        originY :'center',
		        centeredRotation:true,
		        centeredScaling:true
		    });
		    g.fctx.add(_text)
		    font.hidden()
		}
		this.disable = function(){
			font.hidden()
			font.isEnabled = false;
			this.dom.onmousemove = null,this.dom.onmousedown = null;
		}
	})
})(sketch);
