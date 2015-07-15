
var YSCanvas = function(width,height,index){
	this.canvas = null;
	this.canvasWidth = width;
	this.canvasHeight = height;
	this.num = index;
    this.write = null;
    this.shape = null;
    this.down = null;
    this.downCanvas = null
    this.writeCanvas = null
	this.createCanvas();
    this.initCanvas();
    this.addPage();
    this.setActive()
}

YSCanvas.prototype.initCanvas = function(){
    
    this.shape =  new fabric.Canvas('page'+this.num+'shape',{ hoverCursor: 'pointer', selection :false, isdrawingmode:false });
    this.shape.on({
       'object:modified': function(e) {
            if(para.getValue("identify") == Identify.student) return;
         
            var _obj = this.getActiveObject();
            if(!_obj) return;
            var _infor = {
                op : "modifyObject",
                id : _obj.get('id'),
                height : _obj.get('height'),
                width : _obj.get('width'),
                x : _obj.get('left'),
                y :　_obj.get('top'),
                angle : _obj.get('angle'),
                scaleX : _obj.get('scaleX'),
                scaleY : _obj.get('scaleY'),
                currentHeight : _obj.get('currentHeight'),
                currentWidth : _obj.get('currentWidth'),
                radius : _obj.get('radius')
            };
    
            operations.push(_infor)
            
        } 
    })
    this.downCanvas =  document.getElementById('page'+this.num+'down')
    this.down = this.downCanvas.getContext('2d');

    this.writeCanvas = document.getElementById('page'+this.num+'write')
    this.write = this.writeCanvas.getContext('2d');

}

YSCanvas.prototype.addPage = function(){
    $(".addCanvas").before("<span class=\"am-badge am-radius \">"+this.num+"</span>")
}

YSCanvas.prototype.setActive = function(){
    var index = this.num-1
    var dom = $(".page span:eq("+ index +")")
    dom.addClass("am-badge-secondary")
    dom.siblings().removeClass("am-badge-secondary")
    var canvas = $("#page"+this.num)
    canvas.show()
    canvas.siblings().hide()
}

YSCanvas.prototype.createCanvas = function(){
    $('#canvas').append('<div id = "page'+ this.num +'" index="'+ this.num +'" style="width:100%;height: 100%" class="pagebg"><canvas id="page' + this.num + 'line" width='+this.canvasWidth+' height='+this.canvasHeight+' class="pagewrite"></canvas><canvas id="page'+this.num+'write" width='+this.canvasWidth+' height='+this.canvasHeight+' class="pagewrite"></canvas><canvas id="page'+this.num+'down" width='+this.canvasWidth+' height='+this.canvasHeight+' class="pagedown" ></canvas><canvas id="page'+this.num+'shape" width='+this.canvasWidth+' height='+this.canvasHeight+' class="pagewrite" style="z-index:6"></canvas></div>');
    
}

YSCanvas.prototype.getIndex = function(){
	return this.num
}

YSCanvas.prototype.getWrite = function(){
	return this.write
}

YSCanvas.prototype.getWriteCanvas = function(){
    return this.writeCanvas
}

YSCanvas.prototype.getLine = function(){
	return new fabric.Canvas('page'+this.num+'line',{
        selection :false,
        isdrawingmode:false
    });
}

YSCanvas.prototype.getDown = function(){
    return document.getElementById('page'+this.num+'down').getContext('2d');
};

YSCanvas.prototype.getShape = function(){
    return this.shape
};




