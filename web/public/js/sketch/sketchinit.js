"undefined"===typeof sketch && (sketch={});
(function(g){
	
	g.toolkit = {};
	g.trace = [];

	g.init = function(id) {
		g.dom = document.getElementById(id);
		g.canvasArray = [] 
		g.canvasArray.push(new YSCanvas(g.dom,g.canvasArray.length + 1))
		g.currentIndex = 0
		g.canvas =  g.canvasArray ? g.canvasArray[g.currentIndex].getWriteCanvas() : null;
		g.ctx = g.canvasArray ? g.canvasArray[g.currentIndex].getWrite() : null;
		g.fctx = g.canvasArray ? g.canvasArray[g.currentIndex].getShape() : null;
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
