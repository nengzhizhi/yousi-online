//商品模块
//查看玩家消费记录
function userConspHistory(){
	// a：ajax地址
	// b：用户id号码
	var a, b; 
	$.ajax({
		type:"post",
		url: a,
		data: {
			userId: b
		}
	}).done(function(msg){
		if(!msg.error){
			var msg = JSON.parse(msg.data.records);
			var _type, _name, _price, _date;
			_type = msg.type; //均为数组
			_name = msg.name;
			_price = msg.price;
			_date = msg.date;
		}else{
			ajaxCallErrorMod1(msg);
		}
	});
}

//查询主播道具
function anchorTools(){
	// a：ajax地址
	// b：用户id号码
	// c: 房间号
	var a, b, c; 
	$.ajax({
		type:"post",
		url: a,
		data: {
			actorId: b,
			roomId: c
		}
	}).done(function(msg){
		if(!msg.error){
			var _msg = JSON.parse(msg.data.tools);
			var _productId, _amount, _type, _name, _price, _picture, _description;
			_productId = msg.productId; //均为数组
			_amount = msg.amount;
			_type = msg.type;
			_name = msg.name;
			_price = msg.price;
			_picture = msg.picture;
			_description = msg.description;
		}else{
			ajaxCallErrorMod1(msg);
		}
	});
}

//
function buyTools(){
	
}

function ajaxCallMod1(){
	
}

function ajaxCallErrorMod1(msg){
	var msg = JSON.parse(msg.error);
	var _code, _message, _type;
	_code = msg.code;
	_message = msg.message;
	_type = msg.type;
}
