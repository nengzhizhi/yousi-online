$(function(){
	
	
	updateFansList();
	
	$(".allFans").perfectScrollbar();
	
	//粉丝榜
	$(".titleBar4").on("click", function(){
		$(".titleBar3").removeClass("addCheckedColorFont");
		$(".actorStatusSliderBar3").removeClass("addCheckedColorBg");
		$(".titleBar4").addClass("addCheckedColorFont");
		$(".actorStatusSliderBar4").addClass("addCheckedColorBg");
		$("#fansList").show();
		$("#chat").hide();
		$(".chatContent").hide();
	});
	
	$(".titleBar3").on("click", function(){
		$(".titleBar4").removeClass("addCheckedColorFont");
		$(".actorStatusSliderBar4").removeClass("addCheckedColorBg");
		$(".titleBar3").addClass("addCheckedColorFont");
		$(".actorStatusSliderBar3").addClass("addCheckedColorBg");
		$("#fansList").hide();
		$("#chat").show();
		$(".chatContent").show();
	});
	
	$(".actorStatusToggle").on("click", function(){
		if ($(".actorStatusToggleArrow").hasClass("actorStatusToggleArrow1")) {
			$("#fansList").animate({
				top: 62
			}, 200);
		}else{
			$("#fansList").animate({
				top: 272
			}, 200);
		}
	});
	
});

function updateFansList(){
	$.ajax({
		type:"get",
		url: "/app/product/getFansPops",
		data: {roomId: defaultRoomId},
		success: function(data){
			var json = JSON.parse(data);
			var jsonArray = json.data.consumes;
			var userId = [];
			var userName = [];
			var userCount = [];
			var userAvatar = [];
			//console.log(data);
			for(var i=0;i<jsonArray.length;i++){
				userId.push(jsonArray[i].userId);
				userCount.push(jsonArray[i].pops);
			}
			for(var i=0;i<userId.length;i++){
				var id = userId[i];
				$.ajax({
					type:"get",
					url:"/app/user/findUserByUid",
					data: { uid: id },
					async: false,
					success:function(data){
						var j = JSON.parse(data);
						var ja = j.data.user;
						$(".allFans").append(
							'<div class="singleFan">'+
								'<div class="singleFanRank">'+(i+1)+'</div>'+
								'<div class="singleFanImg">'+
								'<img src="'+ja.avatarUri+'"/></div>'+
								'<div class="singleFanName">'+ja.username+'</div>'+
								'<div class="singleFanScore">'+userCount[i]+'</div>'+
							 '</div>'
						);
					}
				});
			}
		}
	});
}
