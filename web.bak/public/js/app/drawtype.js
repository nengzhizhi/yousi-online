//绘画类型
var DrawType = {
    line:"line",
    rectangle:"rectangle",
    move:"move",
    triangle:"triangle",
    circle:"circle",
    erase:"erase",
    font:"font",
    attach:"attach",
    beeline:"beeline"
}
//鼠标状态 
var MouseStatus = {
    down:"MouseDown",
    move:"MouseMove",
    up:"MouseUp"
}
//线条粗细
var DrawStokeWidth = {
    level1 : 2,
    level2 : 3,
    level3 : 5
}
//线条颜色
var DrawStokeColor = {
    redColor:"rgba(255, 0, 0, 1)",
    blackColor:"rgba(0, 0, 0, 1)",
    greenColor:"rgba(0, 255, 0, 1)",
    blueColor:"rgba(0, 0, 255, 1)",
    clearColor:"rgba(255, 255, 255, 0)"
}
//武装填充颜色
var DrawFillColor = {
    redColor:"rgba(255, 0, 0, 1)",
    blackColor:"rgba(0, 0, 0, 1)",
    greenColor:"rgba(0, 255, 0, 1)",
    blueColor:"rgba(0, 0, 255, 1)",
    clearColor:"rgba(255, 255, 255, 0)"
}

var Point = function(x,y) {
    this.x = x || 0
    this.y = y || 0
}

var Identify = {
    student : 'student',
    teacher : 'teacher'
}

var DrawParams = function(){
    this.identify = Identify.teacher
    this.drawType = DrawType.line
    this.lineWidth = DrawStokeWidth.level1
    this.stokeColor = DrawStokeColor.blackColor
    this.fillColor = DrawFillColor.blackColor
    this.mouseStatus = null //鼠标状态
    this.flag = false  // false则表示当前进行绘画操作，true进行移动操作
    this.id = 0; //当前图形id
    this.active = false //当前活动对象
    this.flag = false  // false则表示当前进行绘画操作，true进行移动操作
    this.point = []   // 绘画所需坐标点（宽，高）
    this.lineStyle = [0,0]   // 画笔形状
    this.ctn = undefined  //若为写字操作则为文字内容，绘画操作则为绘画内容，否则为undefined
    this.canvasIndex = 0 //当前画布索引
    this.canvasPages = 0 //画布总数
    this.devicePos = [0,0,802,695] //标注方框位置信息x y width height
    this.drawFree = false //当前是否绘画
}

DrawParams.prototype.setDrawType = function(type){
    if (type == undefined) {
        return
    }
    switch(type){
        case "move":
            this.drawType = DrawType.move
            break;
        case "line":
            this.drawType = DrawType.line
            break;
        case "erase":
            this.drawType = DrawType.erase
            break;
        case "rectangle":
            this.drawType = DrawType.rectangle
            break;
        case "circle":
            this.drawType = DrawType.circle
            break;
        case "triangle":
            this.drawType = DrawType.triangle
            break;
        case "font":
            this.drawType = DrawType.font
            break;
        case "attach":
            this.drawType = DrawType.attach
            break;
        case "beeline":
            this.drawType = DrawType.beeline
            break;
    }
    if (this.drawType == DrawType.move ){
        setIsSelect(true)
    }else{
        setIsSelect(false)
    }
}

function setIsSelect(flag){
    if(flag){
        $('.canvas-container').css('z-index',10)
        canvasArray[para.getValue('canvasIndex')].getShape().selection=true;
        var objs = canvasArray[para.getValue('canvasIndex')].getShape();
        var _objs = objs.toObject();
        var objects = _objs.objects;
        for(var i=0;i<objects.length;i++){
            (objs.item(i)).set('selectable',true)
        }
    }else{
        $('.canvas-container').css('z-index',6)
        canvasArray[para.getValue('canvasIndex')].getShape().selection=false;
        var objs = canvasArray[para.getValue('canvasIndex')].getShape();
        var _objs = objs.toObject();
        var objects = _objs.objects;
        for(var i=0;i<objects.length;i++){
            (objs.item(i)).set('selectable',false)
        }
    } 
}


DrawParams.prototype.setValue = function(key,value){
    for(var i in this){
        if(this.hasOwnProperty(i)){
            if(i===key){
                this[i] = value;
                return;
            }
        }
    }
}

DrawParams.prototype.getValue = function(key){
    return this[key]
}

DrawParams.prototype.setStokeColor = function(color){
    switch(color){
        case "black":
            this.stokeColor = DrawStokeColor.blackColor
            break;
        case "red":
            this.stokeColor = DrawStokeColor.redColor
            break;
        case "green":
            this.stokeColor = DrawStokeColor.greenColor
            break;
        case "blue":
            this.stokeColor = DrawStokeColor.blueColor
            break;
        case "white":
            this.stokeColor = DrawStokeColor.clearColor
            break;
    }
}

DrawParams.prototype.setLineWidth = function(width){
    switch(width){
        case "1":
            this.lineWidth = DrawStokeWidth.level1
            break;
        case "2":
            this.lineWidth = DrawStokeWidth.level2
            break;
        case "3":
            this.lineWidth = DrawStokeWidth.level3
            break;
    }
}

DrawParams.prototype.setFillColor = function(color){
    switch(color){
        case "black":
            this.fillColor = DrawFillColor.blackColor
            break;
        case "red":
            this.fillColor = DrawFillColor.redColor
            break;
        case "green":
            this.fillColor = DrawFillColor.greenColor
            break;
        case "blue":
            this.fillColor = DrawFillColor.blueColor
            break;
        case "white":
            this.fillColor = DrawFillColor.clearColor
            break;
    }
   
}