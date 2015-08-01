
var YSDraw = function(){
   
	
}

YSDraw.prototype.draw = function(para){
	if(!para) return;

    switch(para.getValue('drawType')) {  //判断操作类型
        case DrawType.line:
            canvasArray[para.getValue('canvasIndex')].getShape.selection = false;
            this.freeDraw(canvasArray[para.getValue('canvasIndex')].getWrite(),canvasArray[para.getValue('canvasIndex')].getDown(),canvasArray[para.getValue('canvasIndex')].getWriteCanvas())
            break;
        case DrawType.rectangle:
            this.drawRect(canvasArray[para.getValue('canvasIndex')].getShape())
            break;
        case DrawType.circle:
            this.drawCircle(canvasArray[para.getValue('canvasIndex')].getShape())
            break;
        case DrawType.beeline:
            this.drawBeeLine(canvasArray[para.getValue('canvasIndex')].getShape())
            break;
        case DrawType.triangle:
            this.drawTriangle(canvasArray[para.getValue('canvasIndex')].getShape());
            break;
        case DrawType.font:
            this.drawText(canvasArray[para.getValue('canvasIndex')].getShape());
            break;
        case DrawType.attach:
            
            this.drawImg(canvasArray[para.getValue('canvasIndex')].getShape());

            break;
        case DrawType.erase:
            this.drawEarser(canvasArray[para.getValue('canvasIndex')].getDown());
            break;
    }
}

YSDraw.prototype.getCurrentYSCanvas = function(){
	return canvasArray[currentCanvas]
}


YSDraw.prototype.freeDrawFunc = function(context){
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = para.getValue('stokeColor');
    context.lineWidth =  para.getValue('lineWidth');
    var ppts = para.getValue('point');
    if (ppts.length < 3) {
            var b = ppts[0];
            context.beginPath();
            context.arc(b.x, b.y, context.lineWidth / 2, 0, Math.PI * 2, !0);
            context.fill();
            context.closePath();
            return;
        }

        context.clearRect(0, 0, canvasArray[para.getValue('canvasIndex')].canvasWidth, canvasArray[para.getValue('canvasIndex')].canvasHeight);
        context.beginPath();
        context.moveTo(ppts[0].x, ppts[0].y);
        for (var i = 1; i < ppts.length - 2; i++) {
            var c = (ppts[i].x + ppts[i + 1].x) / 2;
            var d = (ppts[i].y + ppts[i + 1].y) / 2;
            context.quadraticCurveTo(ppts[i].x, ppts[i].y, c, d);
        }
        // For the last 2 points
        context.quadraticCurveTo(
            ppts[i].x,
            ppts[i].y,
            ppts[i + 1].x,
            ppts[i + 1].y
        );
        context.stroke();
}

YSDraw.prototype.freeDraw = function(context,canvasCtx,temp_canvas){
    if(para.getValue('mouseStatus')==MouseStatus.move){
        this.freeDrawFunc(context);
    }
    else if(para.getValue('mouseStatus')==MouseStatus.up){
        canvasCtx.drawImage(temp_canvas, 0, 0);
        context.clearRect(0,0,canvasArray[para.getValue('canvasIndex')].canvasWidth,canvasArray[para.getValue('canvasIndex')].canvasHeight);
    }
}

YSDraw.prototype.drawRect = function(context){
   	context.selection=true;
    var _point = para.getValue('point');
    if(para.getValue('mouseStatus')==MouseStatus.down){
        var rect = new fabric.Rect({
            id:para.getValue('id'),
            width:0,
            height:0,
            left:_point[0].x,
            top:_point[0].y,
            angle:0,
            fill:para.getValue('fillColor') == 'null' ? null : para.getValue('fillColor'),
            stroke:para.getValue('stokeColor'),
            strokeWidth:para.getValue('lineWidth'),
            scaleX:1,
            scaleY:1,
            selectable:true
        });
        context.add(rect);
        context.setActiveObject(rect);
    }else if(para.getValue('mouseStatus')==MouseStatus.move){
        var _endPoint = _point[_point.length-1],
            _startPoint = _point[0],
            _width = _endPoint.x- _startPoint.x,
            _height = _endPoint.y - _startPoint.y,
            _rect = context.getActiveObject();
            _rect.set('width',_width).set('height',_height).set('originX','center').set('originY','center');
            _rect.setCoords();
            context.renderAll();
    }
     
}

YSDraw.prototype.drawCircle = function(context){
    context.selection=true;
    var _point = para.getValue('point');
    if(para.getValue('mouseStatus')==MouseStatus.down){
        var circle = new fabric.Circle({
            id:para.getValue('id'),
            width:0,
            height:0,
            radius:0,
            left:_point[0].x,
            top:_point[0].y,
            fill:para.getValue('fillColor') == 'null' ? null : para.getValue('fillColor'),
            stroke:para.getValue('stokeColor'),
            strokeWidth:para.getValue('lineWidth'),
            scaleX:1,
            scaleY:1,
            originX :'center',
            originY :'center'
        });
        context.add(circle);
        context.setActiveObject(circle);
    }else if(para.getValue('mouseStatus')==MouseStatus.move){
        
        var _endPoint = _point[_point.length-1],
            _startPoint = _point[0],
            _width = _endPoint.x - _startPoint.x,
            _height = _endPoint.y - _startPoint.y,
            _radius = Math.pow((_width*_width+_height*_height),0.5);
            _circle = context.getActiveObject();
            _circle.set('radius',_radius);
            _circle.setCoords();
            context.renderAll();
    }

}

YSDraw.prototype.drawBeeLine = function(context){

    context.selection=true;
    var _point = para.getValue('point');
    if(para.getValue('mouseStatus')==MouseStatus.down){
        var points = [_point[0].x,_point[0].y,_point[0].x,_point[0].y]
        var line = new fabric.Line(points,{
            id:para.getValue('id'),
            fill:para.getValue('fillColor') == 'null' ? null : para.getValue('fillColor'),
            stroke:para.getValue('stokeColor'),
            strokeWidth:para.getValue('lineWidth'),
            scaleX:1,
            scaleY:1
            
        });
        context.add(line);
        context.setActiveObject(line);
    }else if(para.getValue('mouseStatus')==MouseStatus.move){
        var _endPoint = _point[_point.length-1],
            _line = context.getActiveObject();
            _line.set('x2',_endPoint.x+1).set('y2',_endPoint.y-16).set('originX','center').set('originY','center');
            _line.setCoords();
            context.renderAll();
    }
}

//画三角形
YSDraw.prototype.drawTriangle = function(context){
    context.selection=true;
    var _point = para.getValue('point');
    if(para.getValue('mouseStatus')==MouseStatus.down){
        var triangle = new fabric.Triangle({
            id:para.getValue('id'),
            radius:0,
            left:_point[0].x,
            top:_point[0].y,
            fill:para.getValue('fillColor') == 'null' ? null : para.getValue('fillColor'),
            stroke:para.getValue('stokeColor'),
            strokeWidth:para.getValue('lineWidth'),
            scaleX:1,
            scaleY:1
        });
        triangle.set('width',0).set('height',0);
        context.add(triangle);
        context.setActiveObject(triangle);
    }
    else if(para.getValue('mouseStatus')==MouseStatus.move){
        var _endPoint = _point[_point.length-1],
            _startPoint = _point[0],
            _width = _endPoint.x - _startPoint.x,
            _height = _endPoint.y - _startPoint.y,
            _triangle = context.getActiveObject();
            _triangle.set('width',_width).set('height',_height).set('originX','center').set('originY','center');
            _triangle.setCoords();
            context.renderAll();
    }
 
}

//写字
YSDraw.prototype.drawText = function(context){
    context.selection=true;
    var _point = para.getValue('point');
    var _text = para.getValue('ctn');
    if(!_text || _text == '') return;
    var text = new fabric.Text(_text,{
        id:para.getValue('id'),
        radius:0,
        left:_point[0].x,
        top:_point[0].y,
        fill:para.getValue('fillColor') == 'null' ? null : para.getValue('fillColor'),
        stroke:para.getValue('stokeColor'),
        strokeWidth:para.getValue('lineWidth'),
        scaleX:1,
        scaleY:1,
        originX :'center',
        originY :'center',
        centeredRotation:true,
        centeredScaling:true
    });
    context.add(text);
    context.setActiveObject(text);

    operations.push({
        "op" : "drawText",
        "type" : para.getValue("drawType"),
        "id" : text.get('id'),
        "x" : _point[0].x,
        "y" : text.get('top'),
        "ctn" : _text,
        "fillColor" : para.getValue("fillColor"),
        "stokeColor" : para.getValue("stokeColor"),
        "canvasIndex" : para.getValue('canvasIndex'),
        "lineWidth" : para.getValue("lineWidth"),
        "currentHeight" : text.get('currentHeight'),
        "currentWidth" : text.get('currentWidth'),
        "radius" : text.get('radius')
    })
}


YSDraw.prototype.drawEarser = function(context){
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth =  para.getValue('lineWidth')+2;
    context.fillStyle = 'black';
    context.beginPath();
    var _point = para.getValue('point');
    // _point[0][0] = _point[0][0]-0.5;
    // _point[0][1] = _point[0][1]-0.5;
    context.moveTo(_point[0].x, _point[0].y);   
    for (i = 1; i < _point.length-2; i ++)
    {
        var xc =_point[i].x + (_point[i + 1].x-_point[i].x) / 2;
        var yc =_point[i].y + (_point[i + 1].y-_point[i].y) / 2;
        context.quadraticCurveTo(_point[i].x, _point[i].y,xc, yc);
    }
    context.lineTo(_point[_point.length-1].x, _point[_point.length-1].y);
    // _point[0][0] = _point[0][0]+0.5;
    // _point[0][1] = _point[0][1]+0.5;
    context.globalCompositeOperation="destination-out";
    context.stroke();
    context.globalCompositeOperation="source-over";
}

//画图片
YSDraw.prototype.drawImg = function(context){
    
    context.selection=true;
    var _point = para.getValue('point');
    var _imageUrl = para.getValue('ctn');
    if(!_imageUrl || _imageUrl == '') return;
    var img = new Image();
    img.src = _imageUrl;
    img.onload = function(){

        var _img = new fabric.Image(img,{
            id:para.getValue('id'),
            radius:0,
            left:_point[0].x,
            top:_point[0].y,
            scaleX:1,
            scaleY:1,
            originX :'center',
            originY :'center',
            selectable:false
        });
        context.add(_img);

        para.setValue('ctn','')
    }
    
}
