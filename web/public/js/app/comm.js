var phaseText = true;

function chatComm(roomId,chaturl,state,sponsor,remainingTime,playingDate){
	var msg;
	var f = "11.1.0";
	var e = {};
	e.roomId = roomId;
	e.wsUrl=chaturl;
    e.state= state;
    e.sponsor=sponsor;
    e.remainingTime = remainingTime;
	e.playingDate=playingDate;
	e.cookie=encodeURIComponent(document.cookie);
	var h = {};
	h.quality = "high";
	h.bgcolor = "#ffffff";
	h.allowscriptaccess = "always";
	h.allowfullscreen = "true";
	h.wmode = "Opaque";
	h.allowFullScreenInteractive = "true";
	var g = {};
	g.id = "Chat";
	g.name = "Chat";
	g.align = "left";
	g.allowscriptaccess = "always";
	g.allowfullscreen = "true";
	g.allowFullScreenInteractive = "true";	
	swfobject.embedSWF("../swf/WebRoom.swf", "videoPlayer", "100%", "100%", f,"", e, h, g);
}

function appendMessage(message,nickname,time){
//		$('#chatContent').append(
//				'<div class="chatItem"><p class="chatInfo"><span><img src="http://staticlive.douyutv.com/common/douyu/images/spot.png"></span><span class="nickname">'+nickname+'</span><span class="time">('+time+')</span></p><p class="message">'+message+'</p></div>'
//			);
//		var responseDiv=document.getElementById('chatContent');
//		responseDiv.scrollTop=responseDiv.scrollHeight;
}

function send(msg){
//		msg = $(".form-control").val();
	thisMovie("Chat").as_chat_send(msg);
	
}

function buy(){
	
}

function thisMovie(c) {
	if (navigator.appName.indexOf("Microsoft") != -1) {
		return window[c]
	} else {
		return document[c]
	}
}

function js_interaction_buyCard (interactionId,actorId) {
	console.info("js_interaction_buyCard--->");
	console.info(interactionId);
	console.info(actorId);
	console.info(_defaultRoomId);
	

    $.ajax({
    	type: "post",
    	url:"/app/toolcard/buy",
    	data: { 
    		itemId:actorId,
    		interactionId:interactionId
    	},
    	success: function(data){
    		console.info("success:" + data);
    		var a = JSON.parse(data);
    		if(a.data.status == "success"){
    			thisMovie("Chat").as_interaction_updateScore(a.data);
    			getUserBal();
    		}
    		else if(a.error != undefined){
    			showMsgAlert(a.error.message);
    		}
    	},
    	complete: function(data){
    		console.info("complete:" + data);
    	},
    	error:function(data){
    		console.info("error:" + data);
    	}
    });

    console.info("-->js_interaction_buyCard");
	
}

function js_add_message(span, type, message){
	$.ajax({
		type : "post",
		url : "/app/room/addRecords",
		data : {
			roomId : _defaultRoomId,
			span : span,
			type : type,
			message : message
		},
		xhrFields: {
			withCredentials: true
		},		
    	complete: function(data){
    		//console.log(data);
    	}		
	});
}


function js_interaction_useCard(interactionId,actorId,useInfo){
	console.info("js_interaction_useCard--->");
	console.info(interactionId);
	console.info(actorId);
	console.info(useInfo);
	console.info("<--js_interaction_useCard");

    $.ajax({
    	type: "post",
    	url:"/app/toolcard/use",
    	data: { 
    		itemId: actorId,
    		interactionId: interactionId,
    		useInfo: useInfo,
    	},
    	success: function(data){
    		//console.log(data);
    		var a = JSON.parse(data);
    		if(a.data.status == "success"){
    			showMsgAlert("使用成功");
    		}
    	},
    	complete: function(data){
    		//console.log("complete:" + data);
    	}
    });	
}



function js_ws_response(o){
	//console.log(JSON.stringify(o));
	/*
	console.log("///////////");
	console.log(JSON.stringify(o));
	console.log("///////////");
	*/
	var a = JSON.parse(JSON.stringify(o.data));
	var c = JSON.parse(JSON.stringify(o.c));
	//var j = JSON.parse(o);
	var type = a.type;
	var status = a.status;
	var message = a.message;
	var username = a.username;
	var time = a.time;

	if(c=="chat.connect"){
	//if(type=="connect"){
		if(status=="success"){
			$(".sendBtn").fadeIn();
			$("#connectStatus").text("连接成功！").delay(1000).fadeOut();
			//$(".chatLoading").hide();
			//$(".chatContentInner").show();
			$(".userCountNum").text(milliFormat(Math.round(a.chatterCount*100)));
		}
	}
	if(c=="chat.send"){
	//if(type=="send"){
		var time = getTime();
		if(a.status == "success"){
			pushMsgNormal(time, _username, message);
		}
		if(o.error){
			var msg = JSON.parse(o.error).message;
			pushSysMsg(time, msg);
			//console.log(JSON.parse(o.error).message);
		}
		clearChat();
	}
	if(c=="chat.message_push"){
	//if(type=="message_push"){
		var time = time.substr(11,5);
		pushMsgNormal(getTime(), username, message);
		clearChat();
	}
	if(c=="chat.consume_push"){
		console.debug(type);
	//if(type=="consume_push"){
		var time = getTime();
		if(type=="buyCard"){
			console.debug(a.target);
			if(a.target=="null"){
				pushGiftMsg3(time, a.buyer, a.productName);
			}else if(a.target==null){
				pushGiftMsg2(time, a.buyer, a.target, a.productName);
			}else{
				pushGiftMsg2(time, a.buyer, a.target, a.productName, a.number, a.pictureForWeb);		
			}
		}else if(type=="buyGift"){
			pushGiftMsg(time, a.buyer, a.target, a.productName, a.number, a.pictureForWeb);	
			//pushSysGiftMsg(time, a.buyer, a.target, a.number, a.productName);
		}else if(type==null||type==undefined){
			pushGiftMsg(time, a.buyer, a.target, a.productName, a.number, a.pictureForWeb);	
		}
		if(a.rankList){
			var rank = a.rankList;
			rank.sort(function(a,b){
				return b.score - a.score;
			});
			for(var i=0;i<rank.length;i++){
				$(".actorLists1 .actorRank"+(i+1)+" .actorListName").text(rank[i].actor);
				$(".actorLists1 .actorRank"+(i+1)+" .actorListScore").text(milliFormat(rank[i].score));
				$(".actorLists1 .actorRank"+(i+1)+" .actorListImg img").attr("src", rank[i].avatar);	
			}
			updateFansList();
		}
	}
	if(c=="product.showBuyCard"){
		showBuyCard(a);
	}
	
	if(c=="product.updateActorScore"){
		//console.debug(JSON.stringify(a));
		for(var i=0;i<4;i++){
			$(".actorLists2 .actorRank"+(i+1)+" .actorListNameImg .actorListImg img").attr("src", a[i].avatar);
			$(".actorLists2 .actorRank"+(i+1)+" .actorListNameImg .actorListName").text(a[i].name);
			$(".actorLists2 .actorRank"+(i+1)+" .actorListScore").text(a[i].score);
		}
	}
	
	if(c=="product.hideBuyCard"){
		hideBuyCard(a);
	}
	
	if(c=="product.showEndCard"){
		showEndCard(a);
	}
	
	if(c=="product.hideEndCard"){
		hideEndCard(a);
	}
	
	if(c=="chat.ping"){
	//if(type=="ping"){
		$(".userCountNum").text(milliFormat(Math.round((a.chatterCount)*100)));
	}
}

function pushMsgNormal(time, name, msg){
     if(name=="苹果哥哥"||name=="雪姨笑哈哈"||name=="寂寞吸尘器"){
     	 $(".chatContentContainer").append("<table><tr><td class='msgTableTime'>"
	        + time +
	        "</td><td><div class='msgContent'><span class='msgFrom' style='color:red; font-weight:bold;'><span class='superUser'><img src='img/superD.gif' width='12px' height='12px' /></span>"
	        + name +
	        "：</span><span class='msgText superText'>"
	        + msg +
	        "</span></div></td></tr></table>");
     }else{
     	 $(".chatContentContainer").append("<table><tr><td>"
	        + time +
	        "</td><td><div class='msgContent'><span class='msgFrom'>"
	        + name +
	        "：</span><span class='msgText'>"
	        + msg +
	        "</span></div></td></tr></table>");
     }
     scrollToBottom();
}

function pushGiftMsg(time, from, to, gift, amount, url){
	for(var i=1;i<=amount;i++){
		setTimeout(function(){
			 $(".chatContentContainer").append("<table><tr><td class='msgTableTime'>"
		     + time +
		     "</td><td><div class='msgContent'><span class='msgFrom'>"
		     + from +
		     "</span> 向 <span class='msgFrom'>"
		     + to +
		     "</span> 赠送了 <span class='msgFrom'>"
		     + gift +
		     "</span><div style='margin-left: "
		     + (amount>=8?giftDist(i):0) +
		     "px;'><img height='50px' src='"
		     + url +
		     "' /> " 
		     + (i-amount) +
		     "</div></div></td></tr></table>");	
		     i++;
		     scrollToBottom();
		}, 40*i);
	}
}

function pushGiftMsg2(time, from, to, gift){
	 $(".actorLists3Wrapper").append('<table><tr><td class="msgTableTime">'
        + time +
        '</td><td><div class="msgContent"><span>'
        + from +
        '</span> 向 <span>' + to + '</span> 赠送了一张 <span>"' + gift + '"</span></div></td></tr></table>');
     list3ScrollBottom();
     textStress();
}

function pushGiftMsg3(time, from, gift){
	$(".actorLists3Wrapper").append('<table><tr><td class="msgTableTime">'
        + time +
        '</td><td><div class="msgContent"><span>'
        + from +
        '</span> 购买了一张 <span>"' + gift + '"</span></div></td></tr></table>');
     list3ScrollBottom();
     textStress();
}

function pushPhaseMsg(time, card, actorName){
//	$(".actorLists3").append('<div class="phaseMsg"><span>'+time+'</span>开启了<span>'+name+'</span>互动环节</div>');
    if(actorName!=undefined){
    	var message = '<table><tr><td class="msgTableTime">'
	        + time +
	        '</td><td><div class="msgContent">开启了 <span>"'
	        + card +
	        '"</span> 道具互动阶段-<span>'
	        + actorName +
	        '</span></div></td></tr></table>';  
    }else{
	    var message = '<table><tr><td class="msgTableTime">'
	        + time +
	        '</td><td><div class="msgContent">开启了 <span>"'
	        + card +
	        '"</span> 道具互动阶段</div></td></tr></table>';    	
    }

    $(".actorLists3Wrapper").append(message);
    list3ScrollBottom();
    textStress();
}

function pushPhaseMsg2(time, card, actorName){
	//$(".actorLists3").append('<div class="phaseMsg"><span>'+time+'</span><span>'+name+'</span>道具互动环节已结束</div>');

    if(actorName!=undefined){
	    var message = '<table><tr><td class="msgTableTime">'
	        + time +
	        '</td><td><div class="msgContent">'
	        + actorName +
	        '<span>"'
	        + card +
	        '"</span> 道具互动阶段已结束</div></td></tr></table>';  
    }
    else{
	    var message = '<table><tr><td  class="msgTableTime">'
	        + time +
	        '</td><td><div class="msgContent"><span>"'
	        + card +
	        '"</span> 道具互动阶段已结束</div></td></tr></table>';    	
    }

    $(".actorLists3Wrapper").append(message);
    list3ScrollBottom();
    textStress();
}

function pushPhaseMsg3(time, card, name){
	//$(".actorLists3").append('<div class="phaseMsg"><span>'+time+'</span><span>'+name+'</span>获得最多的<span>'+card+'</span>道具，需再次展示刚才的表演</div>');
    $(".actorLists3Wrapper").append('<table><tr><td class="msgTableTime">'
        + time +
        '</td><td><div class="msgContent"><span>'
        + name +
        '</span> 获得了最多的 <span>"'+card+'"</span> 道具，需再次展示刚才的表演</div></td></tr></table>');
    list3ScrollBottom();
    textStress();
}

function pushPhaseMsg4(time, card){
	//$(".actorLists3").append('<div class="phaseMsg"><span>'+time+'</span><span>'+name+'</span>获得最多的<span>'+card+'</span>道具，需再次展示刚才的表演</div>');
    $(".actorLists3Wrapper").append('<table><tr><td class="msgTableTime">'
        + time +
        '</td><td><div class="msgContent"><span>"'
        + card +
        '"</span> 道具环节将在10秒后结束</div></td></tr></table>');
    list3ScrollBottom();
    textStress();
}

function pushPhaseMsg5(time, name){
	//$(".actorLists3").append('<div class="phaseMsg"><span>'+time+'</span><span>'+name+'</span>获得最多的<span>'+card+'</span>道具，需再次展示刚才的表演</div>');
    $(".actorLists3Wrapper").append('<table><tr><td class="msgTableTime">'
        + time +
        '</td><td><div class="msgContent">恭喜<span> '
        + name +
        '</span> 获得指定一名选手换装的权利</div></td></tr></table>');
    list3ScrollBottom();
    textStress();
}

function pushPhaseMsg6(time, name, actor, suit){
	//$(".actorLists3").append('<div class="phaseMsg"><span>'+time+'</span><span>'+name+'</span>获得最多的<span>'+card+'</span>道具，需再次展示刚才的表演</div>');
    $(".actorLists3Wrapper").append('<table><tr><td class="msgTableTime">'
        + time +
        '</td><td><div class="msgContent">玩家<span> '
        + name +
        '</span> 指定 <span>' 
        + actor + '</span> 穿 <span>' 
        + suit + '</span>再秀一次</div></td></tr></table>');
    list3ScrollBottom();
    textStress();
}

function pushPhaseMsg7(time, name, actor, number){
	var message = '<table><tr><td class="msgTableTime">'
 		+ time +
		'</td><td><div class="msgContent">恭喜<span>'
        + actor +
        '</span>收到'
        + number +
        '张<span>'
        + name +
        '</span></div></td></tr></table>';

    $(".actorLists3Wrapper").append(message);
    list3ScrollBottom();
    textStress();
}

function scrollToBottom(){
	if ($(".chatContentContainer").height() > $(".chatContentInner").height()) {
        $(".chatContentContainer").css("bottom", "auto");
    }

    $('.chatContentInner').scrollTop($('.chatContentInner')[0].scrollHeight);
}

function pushSysMsg(time, name){
	$(".chatContentContainer").append("<table><tr><td class='msgTableTime'>"
    + time +
    "</td><td><div class='msgContent'><span class='msgFrom'>"
    + name +
    "</span></div></td></tr></table>");
    scrollToBottom();
}

function pushSysGiftMsg(time, name, target, num, gift){
	var message = '<table><tr><td class="msgTableTime">'
 		+ time +
		'</td><td><div class="msgContent">玩家 <span>'
        + name +
        '</span> 向 <span>'
        + target +
        '</span> 赠送了 <span>'
        + gift +
        ' x '
        + num +
        '</span></div></td></tr></table>';
    $(".actorLists3Wrapper").append(message);
    list3ScrollBottom();
    //textStress();
}

//getTime();

function textStress(){
	$(".actorLists3Wrapper table").css("font-size","12px");
	$(".actorLists3Wrapper table").last().css("font-size","20px");
}

function list3ScrollBottom(){
	if ($(".actorLists3Wrapper").height() > $(".actorLists3").height()) {
     	$(".actorLists3Wrapper").css("bottom", "auto");
    }
	$(".actorLists3").scrollTop($('.actorLists3Wrapper')[0].scrollHeight);
}

function getTime(){
	var time = new Date();
	var hour = (time.getHours()).toString();
	var min = (time.getMinutes()).toString();
	if(hour.length==1){
		hour = "0"+hour;
	}
	if(min.length==1){
		min = "0"+min;
	}
	time = hour+":"+min;
	return time;
}

function giftDist(i){
	switch(i%8){
		case 0:
			return 0;
		break;
		case 1:
			return 15;
		break;
		case 2:
			return 30;
		break;
		case 3:
			return 45;
		break;
		case 4:
			return 60;
		break;
		case 5:
			return 45;
		break;
		case 6:
			return 30;
		break;
		case 7:
			return 15;
		break;
		default:
			console.log("giftDistError!");
	}
}

function sortActorList(rank){
	rank.sort(function(a,b){
		return b.score - a.score;
	});
	for(var i=0;i<rank.length;i++){
		$(".actorLists1 .actorRank"+(i+1)+" .actorListName").text(rank[i].actorName);
		$(".actorLists1 .actorRank"+(i+1)+" .actorListScore").text(milliFormat(rank[i].score));
		$(".actorLists1 .actorRank"+(i+1)+" .actorListImg img").attr("src", rank[i].avatar);	
	}
}

function showBuyCard(a){
	var value = a.interaction.card.name;
	switch(value){
		case "再来一次卡":
			if(phaseText){
				pushPhaseMsg(getTime(), value);
			}
			phaseText = false;
			break;
		case "变装卡":
			var count = a.interaction.card.buyCardSecond;
			if(phaseText){
				pushPhaseMsg(getTime(), value);
			}
			if(count==10){
				pushPhaseMsg4(getTime(), value);
			}
			if(count==1){
				setTimeout(function(){
					pushPhaseMsg2(getTime(), value);
					phaseText = true;
				}, 1000);
			}
			phaseText = false;
			break;
		case "双倍积分卡":
			if(phaseText){
				pushPhaseMsg(getTime(), value);
			}
			var count = a.interaction.card.buyCardSecond;
			if(count==10){
				pushPhaseMsg4(getTime(), value);
			}
			if(count==1){
				setTimeout(function(){
					pushPhaseMsg2(getTime(), value);
					phaseText = true;
				}, 1000);
			}
			phaseText = false;					
			break;
		case "降低难度卡":
			var count = a.interaction.card.buyCardSecond;
			if(phaseText){
				pushPhaseMsg(getTime(), value, a.interaction.actors[0].name);
				phaseText = false;	
			}
			if(count==1){
				phaseText = true;
			}
			break;
	}
}

function hideBuyCard(a){
	var a = a.card.name;
	switch(a){
		case "再来一次卡":
			pushPhaseMsg2(getTime(), a);
			break;
	}
}

function showEndCard(a){
	var card = a.interaction.card.name;
	switch(card){
		case "再来一次卡":
			var actor = a.endCardInfo.actor.name;
			var count = a.interaction.card.endCardSecond;
			console.debug(count);
			if(count==10){
				pushPhaseMsg3(getTime(), card, actor);	
			}
			phaseText = true;
			break;
		case "变装卡":
			if(phaseText){
				var actor = a.endCardInfo.actor.name;
				var winner = a.endCardInfo.winner;
				var suit = a.endCardInfo.useInfo.name;
				pushPhaseMsg5(getTime(), winner);
				pushPhaseMsg6(getTime(), winner, actor, suit);
				phaseText = false;
			}
			break;
		case "降低难度卡":
			if(phaseText){
				pushPhaseMsg2(getTime(), card, a.interaction.actors[0].name);
				pushPhaseMsg7(getTime(), card, a.interaction.actors[0].name, a.endCardInfo.cardNumber);
				phaseText = false;
			}
			break;
	}
}

function hideEndCard(a){
}

function clearChat(){
	var h = $(".chatContentContainer").height();
	//console.debug(h);
	if(h>=6000){
		$(".chatContentContainer").html("");
		//console.log("clear");
	}
}



