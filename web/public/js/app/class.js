
 $(function() {
 	//初始化画板及相关数据
 	var offsetY = 70;
	var canvasHeight = $(window).height() - offsetY;
	var canvasWidth = $(window).width();
	
	var handle = 0;

	//创建初始画板
	var canva1 =  new YSCanvas(canvasWidth,canvasHeight,canvasArray.length + 1)
	canvasArray.push(canva1)

	ydraw = new YSDraw()
 	//para = new DrawParams()
 	// switch(GetQueryString("identify")){
 	// 	case "teacher":
 	// 		para.identify = Identify.teacher
 	// 		break;
 	// 	case "student":
 	// 		para.identify = Identify.student
 	// 		break;
 	// 	default:
 	// 		para.identify = Identify.student
 	// 		break;
 	// }
 	
 	console.log(para.identify)
 	para.setValue("canvasIndex",0)

 	$("#teacher_vedio" ).draggable();
    $("#student_vedio" ).draggable();
    $("#teacher_block" ).draggable(
    	//li中取消拖拽
    	{ cancel: 'ul li' }
    );
    $("#log_block" ).draggable();


 	function showText(points){
 		$('#fillTxtdiv').css({
 			'left':points[0].x,
            'top':points[0].y+offsetY,
            'width':200,
            'height':100
        }).show();
        $('#fillTxt').show().focus();
 	}

 	function hiddenText(){
 		$('#fillTxtdiv').hide()
 	}

 	function showUpload(){
		$('.answerBlock').show()
	}

	function hideUpload(){
		$('.answerBlock').hide();
	    $('.answerBlockName').text('未选择文件');
	    $('.progress').css('width',0);
	    $('.uploadTips').text('');
	}

 	//图形选择
 	$(".tools ul li ul li").click(function(event){
 		if (para.getValue("identify") == Identify.student) return;
 		var $dropdown = $("#chart")
 		$dropdown.dropdown('close')
 		var type = $(this).attr("type")
 		para.setDrawType(type)
 	})

	//工具按钮切换
	$(".tools li").click(function(event){
		if (para.getValue("identify") == Identify.student) return;
 		var type = $(this).children("li a").attr("type")
 		if (type==DrawType.attach){
 			showUpload()
 		}else{
 			$(".tools li a").removeClass("am-primary")
 			$(this).children("li a").addClass("am-primary")
 			para.setDrawType(type)
 		}
	})

	//线条粗线粗细切换
	$(".line li").click(function(event){
		if (para.getValue("identify") == Identify.student) return;
 		$(".line li").removeClass("line_active")
 		$(this).addClass("line_active")
 		$(".line li span").removeClass("line_color")
 		$(this).children("p").children("span").addClass("line_color")
 		var width = $(this).children("p").children("span").attr("type")
 		para.setLineWidth(width)
	})

	//线条颜色切换
	$("#stokecolor li").click(function(event){
		if (para.getValue("identify") == Identify.student) return;
 		$(this).siblings().removeClass("line_active")
 		$(this).addClass("line_active")
 		var type = $(this).children("p").children("span").attr("type")
 		para.setStokeColor(type)
	})

	//填充颜色切换
	$("#fillcolor li").click(function(event){
		if (para.getValue("identify") == Identify.student) return;
 		$(this).siblings().removeClass("line_active")
 		$(this).addClass("line_active")
 		var type = $(this).children("p").children("span").attr("type")
 		para.setFillColor(type)
	})	

	//添加画板事件
	$(".addCanvas").click(function(event){
		if (para.getValue("identify") == Identify.student) return;
		canvasArray.push(new YSCanvas(canvasWidth,canvasHeight,canvasArray.length + 1))
		para.setValue('canvasIndex',canvasArray.length-1)
		operations.push({
            op : "createLayer",
            id : (new Date()).valueOf()
        })
	})


	$(".page").on("click","span",function(event){
		if (para.getValue("identify") == Identify.student) return;
		if(!$(this).hasClass("addCanvas")){
			var index = $(".page span").index(this)
			canvasArray[index].setActive()
			para.setValue('canvasIndex',index)
			operations.push({
	            op : "switchLayer",
            	index : index
	        })
		}
	})

	//鼠标点击事件
	$("#canvas").mousedown(function(e){
		if (para.getValue("identify") == Identify.student) return;
		var _id = (new Date()).valueOf();
		var point = new Point(e.pageX,e.pageY-offsetY)
		para.setValue('mouseStatus',MouseStatus.down);
		para.setValue('point',[point]);
		para.setValue('id',_id);
		operations.push({
			"op" : "mouseDown",
			"type" : para.getValue("drawType"),
			"id" : _id,
			"x" : point.x,
			"y" : point.y,
			"fillColor" : para.getValue("fillColor"),
			"stokeColor" : para.getValue("stokeColor"),
			"canvasIndex" : para.getValue('canvasIndex'),
			"lineWidth" : para.getValue("lineWidth")
		})
		if (para.getValue("drawType") == DrawType.font ){
			showText(para.getValue("point"))
		}else{
			para.setValue("flag",true)
			ydraw.draw(para)
		}
	})

	//鼠标移动事件
	$("#canvas").mousemove(function(e){
		if (para.getValue("identify") == Identify.student) return;
		var point = new Point(e.pageX,e.pageY-offsetY)
		if(para.getValue('flag') == true)
		{
			operations.push({
				"op" : "mouseMove",
				"type" : para.getValue("drawType"),
				"id" : para.getValue("id"),
				"x" : point.x,
				"y" : point.y,
				"fillColor" : para.getValue("fillColor"),
				"stokeColor" : para.getValue("stokeColor"),
				"canvasIndex" : para.getValue('canvasIndex'),
				"lineWidth" : para.getValue("lineWidth"),
				"flag" : para.getValue('flag')
			})
		}
		if(para.getValue('flag') == false) return;
		console.log("move")
		
		para.setValue('mouseStatus',MouseStatus.move);
		var _point = para.getValue('point');
        _point.push(point);
        para.setValue('point',_point);
       
		ydraw.draw(para)
	})

	//鼠标抬起事件
	$("#canvas").mouseup(function(e){
		if (para.getValue("identify") == Identify.student) return;
		para.setValue('mouseStatus',MouseStatus.up);	
		para.setValue("flag",false)
		var point = new Point(e.pageX,e.pageY-offsetY)
		ydraw.draw(para)	
		operations.push({
			"op" : "mouseUp",
			"type" : para.getValue("drawType"),
			"id" : para.getValue("id"),
			"x" : point.x,
			"y" : point.y,
			"fillColor" : para.getValue("fillColor"),
			"stokeColor" : para.getValue("stokeColor"),
			"canvasIndex" : para.getValue('canvasIndex'),
			"lineWidth" : para.getValue("lineWidth")
		})
	})

	//隐藏文本输入图层 
	$("#cancelText").click(function(event){
		hiddenText()
	})
	//显示文本输入图层 
	$("#createText").click(function(event){
		var value = $('#fillTxt').val();
        $('#fillTxtdiv').hide();
        console.log("getValue:",value)
        if(!value || value=='') return;
        para.setValue('ctn',value);
       
       
        ydraw.draw(para)
        $('#fillTxt').val('');
	})

	//关闭
	$('.answerBlockBtn').click(function(){
	    hideUpload()
	});

    //拖拽课件
    var dragEle = null;
    $('#teacher_block').on('dragstart','li',function(e){
        dragEle = e.target;
    });

    
    $('#teacher_block').on('dragend','li',function(e){
        dragEle = null;
        return false;
    });

    $('.canvasWrapper')[0].ondrop = function(e){
        if(dragEle){
            var _id = Date.parse(new Date());
            var _oldImgUrl = $(dragEle).attr('data');
            var _imgUrl = _oldImgUrl;
            para.setValue('id',_id);
            para.setValue('drawType',DrawType.attach);
            para.setValue('ctn',_imgUrl);
            var point = new Point(e.pageX, e.pageY-offsetY)
            para.setValue('point',[point]);
            operations.push({
				"op" : "drawImage",
				"type" : para.getValue("drawType"),
				"id" : para.getValue("id"),
				"x" : point.x,
				"y" : point.y,
				"ctn" : _imgUrl,
				"fillColor" : para.getValue("fillColor"),
				"stokeColor" : para.getValue("stokeColor"),
				"canvasIndex" : para.getValue('canvasIndex'),
				"lineWidth" : para.getValue("lineWidth")
			})
            ydraw.draw(para);
        }
        return false
    }

    $('.canvasWrapper')[0].ondragover = function(ev) {
        /*拖拽元素在目标元素头上移动的时候*/
        ev.preventDefault();
        return true;
    };

    $('.canvasWrapper')[0].ondragenter = function(ev) {
        /*拖拽元素进入目标元素头上的时候*/
        return true;
    };
    if(para.getValue("identify") == Identify.teacher) {
    	handle = setInterval(function(){
			if(operations && operations.length > 0){
				socket.sendJSONString({
					c : 'draw',
					data : {
						"roomId" : para.getValue('roomId'),
			        	"answeringId" : para.getValue('answeringId'),
			        	"operations" : operations
					}
						
				})
				operations = [];
			}
		}, 30);
    };
    

	socket.close(function(){
		if (para.getValue("identify") == Identify.teacher){
			clearInterval(handle);
		}
		
	})

	socket.receieve(function(data){
		if(data.c == 'join_push'){
			para.answeringId = data.data.answeringId;
		} else if(data.c=='draw'){
			if (para.getValue("identify") == Identify.teacher) return;
			var drawArray = data.data.operations
			if (drawArray == undefined) return;
			console.log(drawArray)
			for (var i = 0; i < drawArray.length; i++) {
				var obj = drawArray[i]
				console.log("obj",obj)
				switch(obj.op){
					case "createLayer":
						console.log("createLayer")
						canvasArray.push(new YSCanvas(canvasWidth,canvasHeight,canvasArray.length + 1))
						para.setValue('canvasIndex',canvasArray.length-1)
						break;
					case "switchLayer":
						canvasArray[obj.index].setActive()
						para.setValue('canvasIndex',obj.index)
						break;
					case "mouseDown":
						if (obj.type == DrawType.move) continue;
						var point = new Point(obj.x,obj.y)

						para.setValue("drawType",obj.type)
						para.setValue('point',[point]);
						para.setValue("stokeColor",obj.stokeColor)
						para.setValue("fillColor",obj.fillColor)
						para.setValue("lineWidth",obj.lineWidth)
						para.setValue('id',obj.id);
						para.setValue('mouseStatus',MouseStatus.down);
						canvasArray[obj.canvasIndex].setActive()
						ydraw.draw(para)
						break; 
					case "mouseMove":
						if (obj.type == DrawType.move) continue;
						console.log("receieve flag ",obj.flag)
						if (obj.flag == false) continue
						var point = new Point(obj.x,obj.y)
						para.setValue('mouseStatus',MouseStatus.move);
						para.setValue("stokeColor",obj.stokeColor)
						para.setValue("fillColor",obj.fillColor)
						para.setValue("lineWidth",obj.lineWidth)
						var _point = para.getValue('point');
				        _point.push(point);
				        para.setValue('point',_point);
				        ydraw.draw(para)
				        break;
				    case "mouseUp" :
				    	if (obj.type == DrawType.move) continue;
				    	para.setValue('mouseStatus',MouseStatus.up);	
						para.setValue("flag",false)
						ydraw.draw(para)	
						break;
					case "modifyObject":
						var _canvas = canvasArray[para.getValue('canvasIndex')].getShape()

					    var _objs = _canvas._objects;
					    var _aimObj = null;
				
					    for (var j = 0; j < _objs.length; j++) {
					    	if(_canvas.item(j).id == obj.id){
					            _aimObj = _canvas.item(j);
					            _aimObj.set('height',obj.height);
					            _aimObj.set('width',obj.width);
					            _aimObj.set('left',obj.x);
					            _aimObj.set('top',obj.y);
					            _aimObj.set('angle',obj.angle);
					            _aimObj.set('scaleX',obj.scaleX);
					            _aimObj.set('scaleY',obj.scaleY);
					            _aimObj.set('currentHeight',obj.currentHeight);
					            _aimObj.set('currentWidth',obj.currentWidth);
					            _aimObj.set('radius',obj.radius);
					            _aimObj.setCoords();
					            _canvas.renderAll();
					        }
					    }
						break;
					case "drawText" :
					    para.setValue('ctn',obj.ctn);
					    para.setValue("stokeColor",obj.stokeColor)
						para.setValue("fillColor",obj.fillColor)
						para.setValue("lineWidth",obj.lineWidth)
					    ydraw.draw(para);
						break; 
					case "drawImage" :
						var point = new Point(obj.x,obj.y)
						para.setValue("id",obj.id)
	            		para.setValue('point',[point]);
						para.setValue('drawType',DrawType.attach);
						para.setValue('ctn',obj.ctn);
					    para.setValue("stokeColor",obj.stokeColor)
						para.setValue("fillColor",obj.fillColor)
						para.setValue("lineWidth",obj.lineWidth)
					    ydraw.draw(para);
					    para.setDrawType(DrawType.move)
					    break;
					}
				};
			}
		})

});