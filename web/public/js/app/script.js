$(function() {
	var isScale1 = 0;
	var isScale2 = 0;
	var isAppDownload = true;
	var isShareMore = false;
	var leftSwitch = true;
	var rightSwitch = true;
   	_defaultRoomId = "544e007ab99a88bc8b6c401e";
   //	_chatUrl = "";
/*	$.ajax({
		type: "get",
		url: "/app/setting/get",
		async: false,
		success: function(result) {
			console.log("result: " + result);
			var data = jQuery.parseJSON(result).data;
			_defaultRoomId = data.defaultRoomId;
			_chatUrl = data.chatUrl;
		}
	});*/
	var userChatContent = "";
	var tempRef = null;
	var gBarLeft1 = 0;
	var gBarLeft2 = 0;
	var codeCount = 6;
	//左右收缩图标
	//0 - 1 ： 左边_左右
	//2 - 3 : 右边_左右
	//4 - 5 ： 变色左边_左右
	//6 - 7 ： 变色右边_左右
	var scaleSwitchImg = [
		"url(img/zbj.png) no-repeat -279px -50px",
		"url(img/zbj.png) no-repeat -327px -50px",
		"url(img/zbj.png) no-repeat -375px -50px",
		"url(img/zbj.png) no-repeat -423px -50px",
		"url(img/zbj.png) no-repeat -303px -50px",
		"url(img/zbj.png) no-repeat -351px -50px",
		"url(img/zbj.png) no-repeat -399px -50px",
		"url(img/zbj.png) no-repeat -447px -50px"
	];

	//chatComm(_defaultRoomId, _chatUrl);
	initStageMod();
	checkIsScale();
	chatLoading();
	setVideoHeight();
	setChatHeight();
	setTimeout(function() {
		initStageMod();
	}, 500);
	readActorScore();
	detectLogin();

	//if(url=="/"){
	$("#container").perfectScrollbar();
	$(".chatContentInner").perfectScrollbar();
	$(".actorLists3").perfectScrollbar();
	$(".ps-scrollbar-y").width(6);
	//}
	//test

	$("#container").on("scroll", function() {
		clearTimeout(tempRef);
		$(".ps-scrollbar-y").stop().fadeIn(100);
		tempRef = setTimeout(function() {
			$(".ps-scrollbar-y").stop().fadeOut(100);
		}, 1500);
	});

	//test-end

	$("#connectStatus").text("聊天室连接中，请稍后...");
	//$("#left").html("<img src='/public/img/2.png' />");

	$.ms_DatePicker({
		YearSelector: ".sel_year",
		MonthSelector: ".sel_month",
		DaySelector: ".sel_day"
	})

	//当浏览器大小改变时
	$(window).resize(function() {
		checkIsScale();
		initStageMod();
		setChatHeight();
		setVideoHeight();
		giftBarCheck();
		toolBarCheck();
	});

	//BindCity("上海");

	$(".navSub").click(function() {
		var obj = $(this).find(".nav1Name");
		var name = $.trim(obj.html());
		var name2 = $.trim($(".navSelected").children(".nav1Name").html());
		if (name != name2) {
			pageSwitch(name);
		}
	});

	$(".miniLeftIconSet ul li").on("click", function() {
		var name = $(this).children().eq(2).children().eq(1).text();
		if (name != "" && name != null && (document.URL).split("/")[3] != "index") {
			pageSwitch(name);
		}
	});

	//左边栏Hover
	//  $(".navSub").on({
	//      mouseenter: function () {
	//          var id = $(this).children(":nth-child(2)").attr("class");
	//          id = id.substr(id.length - 1);
	//          var pY = -(id - 1) * 35 - 1;
	//          pY = pY.toString();
	//          if ($.isNumeric(id)) {
	//              if ($(this).children().first().hasClass("navHighlight")) {
	//                  $(".nav1Icon" + id).css("background", "url(../img/zbj.png) no-repeat -245px " + pY + "px");
	//              } else {
	//                  $(".nav1Icon" + id).css("background", "url(../img/zbj.png) no-repeat -245px " + pY + "px");
	//              }
	//          }
	//      },
	//      mouseleave: function () {
	//          var id = $(this).children(":nth-child(2)").attr("class");
	//          id = id.substr(id.length - 1);
	//          var pY = -(id - 1) * 35 - 1;
	//          pY = pY.toString();
	//          if ($.isNumeric(id)) {
	//              if ($(this).children().first().hasClass("navHighlight")) {
	//                  $(".nav1Icon" + id).css("background", "url(../img/zbj.png) no-repeat -245px " + pY + "px");
	//              } else {
	//                  $(".nav1Icon" + id).css("background", "url(../img/zbj.png) no-repeat -210px " + pY + "px");
	//              }
	//          }
	//      }
	//  });

	//左右缩放操作
	$("#leftScale, #rightScale").hide();
	$("#left, #leftScale, #switchTriggerLeft, #miniLeft").on("mouseenter", function() {
		$("#leftScale").stop().fadeIn();
	});

	$("#left, #leftScale, #switchTriggerLeft, #miniLeft").on("mouseleave", function() {
		$("#leftScale").stop().fadeOut();
	});

	$("#right, #rightScale, #switchTriggerRight").on("mouseenter", function() {
		$("#rightScale").stop().fadeIn();
	});

	$("#right, #rightScale, #switchTriggerRight").on("mouseleave", function() {
		$("#rightScale").stop().fadeOut();
	});

	//logo点击返回首页
	$(".logo").on("click", function(){
		window.location.href = "../index"
	});

	//左边栏以及右边栏操作
	$("#leftScale").click(function() {
		isScale1 = 1;
		scaleSwitchLeft();
		initStageMod();
	});

	$("#rightScale").click(function() {
		isScale2 = 1;
		scaleSwitchRight();
		initStageMod();
	});


	//迷你左边栏操作
	$(".miniLeftIconSet ul li").on("mouseenter", function() {
		$(this).children().eq(2).stop(true, true).fadeIn(200);
	}).on("mouseleave", function() {
		$(this).children().eq(2).stop(true, true).fadeOut(200);
	});

	$(".miniPersonalIcon").on("mouseenter", function() {
		$(this).siblings().stop(true, true).fadeIn(200);
	}).on("mouseleave", function() {
		$(this).siblings().stop(true, true).fadeOut(200);
	});

	$(".miniPersonalIcon").on("click", function() {
		if (notLogin()) {
			showLogin();
		} else {
			window.location = "profile.html";
		}
	});

	//ui弹窗
	$(".alertBtn").on("click", function() {
		var value = $(this).data("type");
		switch (value) {
			case "close":
				$(this).parent().hide();
				break;
			case "topup":
				window.location = "topup.html";
				$(this).parent().hide();
				break;
			default:
				console.log("弹窗错误");
				break;
		}
	});

	//任务操作
	$(".userTask").on("click", function() {
		if (notLogin()) {
			showLogin();
		} else {
			$(".index-task-panel").fadeToggle(100);
		}
	});

	$(".index-task-title").on("click", function() {
		window.location = "/taskCenter.html";
	});

	//礼物操作
	$(".userGift").click(function() {
		if (notLogin()) {
			showLogin();
		} else {
			$(this).toggleClass("userGiftC");
			$(this).toggleClass("userGiftH");
			if ($(this).is(".userGiftC")) {
				$(".userTools").removeClass("userToolsC");
				$(".userTools").addClass("userToolsH");
				$(this).removeClass("userGiftH");
			}
			$(".toolBar").fadeOut(100);
			$(".giftBar").fadeToggle(100);
			giftBarCheck();
		}

	});

	$(".userTools").click(function() {
		if (notLogin()) {
			showLogin();
		} else {
			$(this).toggleClass("userToolsH");
			$(this).toggleClass("userToolsC");
			if ($(this).is(".userToolsC")) {
				$(".userGift").removeClass("userGiftC");
				$(".userGift").addClass("userGiftH");
				$(this).removeClass("userToolsH");
			}
			$(".giftBar").fadeOut(100);
			$(".toolBar").fadeToggle(100);
			toolBarCheck();
		}
	});

	$(".userTask").on("click", function() {
		$(this).toggleClass("userTaskH");
		$(this).toggleClass("userTaskC");
	});

	$(".userTopup").on("click", function() {
		//		$(this).toggleClass("userTopupH");
		//		$(this).toggleClass("userTopupC");
		if (notLogin()) {
			showLogin();
		} else {
			window.open("topup.html");
		}
	});

	$(".addAmount").mousedown(function() {
		if (notLogin()) {
			showLogin();
		} else {
			$(".giftBundle").fadeToggle();
		}
	});

	$(".giftBundle ul li").on("click", function() {
		var amount = $(this).data("giftbundle");
		amount = parseInt(amount);
		$(".giftAmountInput").val(amount);
		$(".giftBundle").fadeToggle();

	});

	$(".reduceAmount").click(function() {
		var value = $(".giftAmountInput").val();
		if (value > 1) {
			value--;
		}
		if (value == 1) {
			$(".reduceAmountEnable").hide();
			//$(".giftSendBtnEnable").hide();
			$(".reduceAmountDisable").show();
			//$(".giftSendBtnDisable").show();
			value = 1;
		}
		$(".giftAmountInput").val(value);

	});

	$(".giftAmountInput").on("keydown", function(e) {
		if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
			// Allow: Ctrl+A
			(e.keyCode == 65 && e.ctrlKey === true) ||
			// Allow: home, end, left, right
			(e.keyCode >= 35 && e.keyCode <= 39)) {
			// let it happen, don't do anything
			return;
		}
		// Ensure that it is a number and stop the keypress
		if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
			e.preventDefault();
		}
	});

	$(document).on("mouseenter", ".giftCardsImg", function() {
		$(this).css("background-color", "#f1f1f1");
	});

	$(document).on("mouseleave", ".giftCardsImg", function() {
		var value = $(this).parent().attr("data-select");
		if (value == "true") {
			$(this).css("background-color", "#f1f1f1");
		} else {
			$(this).css("background-color", "#dddddd");
		}
	});

	$(document).on("click", ".giftCardsImgWrapper", function() {
		$(".giftCardsImgWrapper").css("background-color", "#dddddd");
		$(".giftCardsImg").css("background-color", "#dddddd");
		$(".giftCardsImgWrapper").attr("data-select", "false");
		$(this).css("background-color", "#ff0000");
		$(this).attr("data-select", "true");
		$(this).children(".giftCardsImg").css("background-color", "#f1f1f1");
	});

	$(".giftBarLeftArrow").click(function() {
		gBarLeft1 += 85;
		giftBarCheck();
		$(".giftsWrapper").animate({
			left: "+=85px"
		}, {
			duration: 100
		});
	});

	$(".giftBarRightArrow").click(function() {
		gBarLeft1 -= 85;
		giftBarCheck();
		$(".giftsWrapper").animate({
			left: "-=85px"
		}, {
			duration: 100
		});
	});


	$(".giftSendOptions").on("click", function() {
		$(".giftSendToList").fadeToggle();
	});

	$(document).on("click", ".giftSendToLists", function() {
		var name = $(this).text();
		var actorId = $(this).attr("data-actorId");
		$(".giftDefaultText").text(name);
		$(".giftDefaultText").attr("data-actorId", actorId);
		if (name != "选择赠送对象") {
			$(".giftSendBtnEnable").show();
			$(".giftSendBtnDisable").hide();
		}
	});

	$(".toolSendOptions").on("click", function() {
		$(".toolSendToList").fadeToggle();
	});

	$(document).on("click", ".toolSendToLists", function() {
		var name = $(this).text();
		var actorId = $(this).attr("data-actorId");
		$(".toolDefaultText").text(name);
		$(".toolDefaultText").attr("data-actorId", actorId);
	});

	//选手简介UI
	$(document).on("mouseenter", ".actorShowImg", function() {
		$(this).children().fadeIn(200);
	}).on("mouseleave", ".actorShowImg", function() {
		$(this).children().fadeOut(200);
	});

	//我要系列
	$(".myPost").on("click", function() {
		if (notLogin()) {
			showLogin();
		} else {
			window.open("profile.html#myPost");
		}
	});

	$(".myNaming").on("click", function() {
		if (notLogin()) {
			showLogin();
		} else {
			window.open("profile.html#myNaming");
		}
	});

	$(".mySingup").on("click", function() {
		if (notLogin()) {
			showLogin();
		} else {
			window.open("profile.html#mySingup");
		}
	});

	//送礼
	$(".giftSendBtnEnable").on("click", function() {
		var actorName = $(".giftDefaultText").text();
		//var selected = $(".giftCards .giftCardChecked[style='display: block;']");
		var selected = $(".giftCardsImgWrapper[data-select='true']");
		var isSelect = selected.length;
		//检验是否选择选手
		if (actorName === "选择赠送对象") {
			showMsgAlert("请选择赠送对象");
		} else if (isSelect == 0) {
			showMsgAlert("请选择礼物");
		} else {
			var amount = $(".giftAmountInput").val();
			var actorId = $(".giftDefaultText").attr("data-actorId");
			var product = selected;
			var price = product.attr("data-price");
			var productId = product.attr("data-productId");
			console.log("gift amount: " + amount);
			var params = {
				"count": amount,
				"actorId": actorId,
				"giftId": productId,
				"price": price,
				"roomId": _defaultRoomId
			};
			var url = "/app/gift/buy";
			$.post(url, params,
				function(result) {
					var data = jQuery.parseJSON(result).data;
					if (data.status === "success") {
						getUserBal();
						console.log("gift on!");
					} else {
						showMsgAlert("赠送失败。");
					}
				});


		}
	});


	//左边栏操作
	$(".leftIconQr").click(function() {
		if (temp1 == 1) {
			$(".showQrCode").fadeOut(100);
			$(".leftIconQr").hover(function() {
				$(".showQrCode").fadeIn(100);
			}, function() {
				$(".showQrCode").fadeOut(100);
			});
			temp1 = 0;
		} else {
			$(this).unbind("mouseenter");
			$(this).unbind("mouseleave");
			$(".showQrCode").fadeIn(100);
			temp1 = 1;
		}

	});

	$(".leftIconQr").hover(function(e) {
		hoverIn(".showQrCode");
	}, function() {
		hoverOut(".showQrCode");
	});

	//迷你左边栏操作
	$(".miniLeftFirstIcon").hover(function() {
		hoverIn(".miniLeftFirstMsg");
	}, function() {
		hoverOut(".miniLeftFirstMsg");
	});

	$(".miniLeftSecondIcon").hover(function() {
		hoverIn(".miniLeftSecondMsg");
	}, function() {
		hoverOut(".miniLeftSecondMsg");
	});
	$(".miniLeftThirdIcon").hover(function() {
		hoverIn(".miniLeftThirdMsg");
	}, function() {
		hoverOut(".miniLeftThirdMsg");
	});

	$(".titleBar2").click(function() {
		$(this).addClass("addCheckedColorFont");
		$(".actorStatusSliderBar1").removeClass("addCheckedColorBg");
		$(".titleBar1").removeClass("addCheckedColorFont");
		$(".actorStatusSliderBar2").addClass("addCheckedColorBg");
	});

	$(".titleBar1").click(function() {
		$(this).addClass("addCheckedColorFont");
		$(".actorStatusSliderBar2").removeClass("addCheckedColorBg");
		$(".titleBar2").removeClass("addCheckedColorFont");
		$(".actorStatusSliderBar1").addClass("addCheckedColorBg");
	});

	$(".topRight").on("click", function() {
		var index = $(this).index();
		$(".topRight").removeClass("addCheckedColorFont");
		$(".actorStatusSelector").css("left", (index - 1) * 33 + "%");
		$(this).addClass("addCheckedColorFont");
		$(".aLists").fadeOut(200);
		switch (index) {
			case 1:
				$(".actorLists3").fadeIn(200);
				break;
			case 2:
				$(".actorLists1").fadeIn(200);
				break;
			case 3:
				$(".actorLists2").fadeIn(200);
				break;
			default:
				console.log("互动道具记录方位有问题");
		}
	});

	//  $(".actorStatusToggleArrow1").click(function () {
	$(".actorStatusToggle").click(function() {
		if ($(".actorStatusToggleArrow").hasClass("actorStatusToggleArrow1")) {
			//$("#chat").hide();
			$(".actorLists3Wrapper").hide();
			$("#actorStatus").slideUp("fast", function() {
				$(".actorStatusToggleArrow").removeClass("actorStatusToggleArrow1").addClass("actorStatusToggleArrow2");
			});
			setChatHeight2();
		} else {
			//$("#chat").show();
			$("#actorStatus").slideDown("fast", function() {
				$(".actorLists3Wrapper").show();
				$(".actorStatusToggleArrow").removeClass("actorStatusToggleArrow2").addClass("actorStatusToggleArrow1");
			});
			setChatHeight();
		}
	});

	//显示在线用户
	$(".userGroup").on("click", function() {
		$(".usersListNdmin").text("");
		if ($("#right").css("display") != "none") {
			$(".usersList").animate({
				top: 0
			}, 200);
		}
		$.ajax({
			type: "post",
			url: "http://vls.whonow.cn:8086/vls/chat/getChatters",
			data: {
				roomId: "544e007ab99a88bc8b6c401e",
				start: 0,
				count: 100
			}
		}).done(function(data) {
			console.log("json data from origin");
			console.log(data);
			var str = JSON.parse(data);
			var num = str.data.chatters.length;
			$(".usersListNdmin").append('<div class="usersListAtitle">用户(<span>' + num + '</span>人)</div>');
			$.each(str.data.chatters, function(i, item) {
				$(".usersListNdmin").append(
					'<div class="usersListNusers">' +
					'<div class="usersListNusersImg"><img src="' + item.avatar + '"/></div>' +
					'<div class="usersListNusersName">' + item.username + '</div>' +
					'<div class="usersListNusersLvl">LV1</div>' +
					'</div>'
				);
			});
		});
	});

	$(".closeUsersList").on("click", function() {
		$(".usersList").animate({
			top: "100%"
		}, 200);
	});

	//右边栏聊天栏操作
	$(".chatInputAreaInner input").keyup(function() {
		var currentSize = $(this).val().length;
		if (currentSize > 20) {
			var a = $(this).val();
			a = a.substring(0, 20);
			$(this).val(a);
		}
	});

	$(".chatInputAreaInner input").focus(function() {
		$(this).parent().css({
			"border": "2px solid rgb(255,166,9)"
		});
	}).blur(function() {
		$(this).parent().css({
			"border": "2px solid #EAEAEA"
		});
	});

	//更多分享
	$(".myShareMore").on("click", function() {
		if (isShareMore) {
			$(".moreShares").fadeOut(200);
			$(this).css("background", "url(../img/zbj.png) no-repeat -20px -624px");
			isShareMore = false;
		} else {
			$(".moreShares").fadeIn(200);
			$(this).css("background", "url(../img/zbj.png) no-repeat 0px -624px");
			isShareMore = true;
		}
		//$(".moreShares").fadeToggle(200);
	}).on("mouseenter", function() {
		if (isShareMore) {
			$(this).css("background", "url(../img/zbj.png) no-repeat -20px -690px");
		} else {
			$(this).css("background", "url(../img/zbj.png) no-repeat 0px -690px");
		}
	}).on("mouseleave", function() {
		if (isShareMore) {
			$(this).css("background", "url(../img/zbj.png) no-repeat 0px -624px");
		} else {
			$(this).css("background", "url(../img/zbj.png) no-repeat -20px -624px");
		}
	});

	$(".personalNav").mouseenter(function() {
		$(this).addClass("navHoverTemp");
	});
	$(".personalNav").mouseleave(function() {
		$(this).removeClass("navHoverTemp");
	});

	$(".personalNav").click(function() {
		$(this).addClass("navHover");
		$(this).children(".bottomLine").addClass("navLineHover");
		$(this).siblings().removeClass("navHover");
		$(this).siblings().children(".bottomLine").removeClass("navLineHover");
	});

	$(".questDescription textarea").keyup(function() {
		var currentSize = $(this).val().length;
		if (currentSize > 149) {
			var a = $(this).val();
			a = a.substring(0, 149);
			$(this).val(a);
		}
		var final = (currentSize) + "/150";
		$(".questDescriptionCount").text(final);
	});

	$(".answerTabAdd").click(function() {
		var count = $(".answerTab").length;
		if (count < 4) {
			var dom = $('<div class="answerTab"><div class="redWrong"></div><input type="text" placeholder="请在此填写干扰答案"/><div class="deleteAnswer"></div></div>');
			$(dom).delegate(".deleteAnswer", "click", function() {
				$(this).parent().remove();
			});
			$(this).before(dom);
		} else {
			$(".alertMsg").text("最多4个，不能再多了").fadeIn().delay(1000).fadeOut();
		}
	});

	$(".deleteAnswer").click(function() {
		$(this).parent().remove();
	});

	makeAndOldQuest();
	$(".questTypeSelection2").click(function() {
		$(".answerDescription").slideUp();
		$(".makeQuestComment").css("margin-top", "10px");
	});
	$(".questTypeSelection1").click(function() {
		$(".answerDescription").slideDown();
		$(".makeQuestComment").css("margin-top", "56px");
	});

	$(".oldQuestTitle").click(function() {
		$(".triangleSlider").css("left", "220px");
		$(this).addClass("addApricot");
		$(".makeQuestTitle").removeClass("addApricot");
	});
	$(".makeQuestTitle").click(function() {
		$(".triangleSlider").css("left", "90px");
		$(this).addClass("addApricot");
		$(".oldQuestTitle").removeClass("addApricot");
	});

	$(".userQuest").click(function() {
		$(".shuffles").fadeOut(100);
		$(".shuffle1").fadeIn(100);

	});

	$(".userProfile").click(function() {
		$(".shuffles").fadeOut(100);
		$(".shuffle4").fadeIn(100);
	});

	$(".userPwd").click(function() {
		$(".shuffles").fadeOut(100);
		$(".shuffle3").fadeIn(100);
	});

	$(".userIcon").click(function() {
		$(".shuffles").fadeOut(100);
		$(".shuffle2").fadeIn(100);
	});

	// 头像裁剪功能
	// Create variables (in this scope) to hold the API and image size
	var jcrop_api,
		boundx,
		boundy,

		// Grab some information about the preview pane
		$preview = $('#preview-pane'),
		$pcnt = $('#preview-pane .preview-container'),
		$pimg = $('#preview-pane .preview-container img'),

		xsize = $pcnt.width(),
		ysize = $pcnt.height()

	$(".oldQuestReward").click(function() {
		$(this).css({
			"color": "#B3B3B3",
			"cursor": "auto"
		});
		var a = $(this).parent().next().html("<div class='moneyStyle'>+100G</div>");
		$(this).parent().next().children().delay(1).animate({
			top: "32px",
			opacity: 0
		}, 1000);

	});

	//粉丝榜
	$(".allFans").perfectScrollbar();

	$(".titleBar4").on("click", function() {
		$(".titleBar3").removeClass("addCheckedColorFont");
		$(".actorStatusSliderBar3").removeClass("addCheckedColorBg");
		$(".titleBar4").addClass("addCheckedColorFont");
		$(".actorStatusSliderBar4").addClass("addCheckedColorBg");
		$("#fansList").show();
		$("#chat").hide();
		$(".chatContent").hide();
	});

	$(".titleBar3").on("click", function() {
		$(".titleBar4").removeClass("addCheckedColorFont");
		$(".actorStatusSliderBar4").removeClass("addCheckedColorBg");
		$(".titleBar3").addClass("addCheckedColorFont");
		$(".actorStatusSliderBar3").addClass("addCheckedColorBg");
		$("#fansList").hide();
		$("#chat").show();
		$(".chatContent").show();
	});

	$(".actorStatusToggle").on("click", function() {
		if ($(".actorStatusToggleArrow").hasClass("actorStatusToggleArrow1")) {
			$("#fansList").animate({
				top: 62
			}, 200);
		} else {
			$("#fansList").animate({
				top: 272
			}, 200);
		}
	});


	//登陆注册UI操作
	$(".rembMeBox, .registerRuleCb").on("click", function() {
		$(this).toggleClass("toggleCbSmall");
	});

	$(".loginText2").click(function() {
		hideLoginSets();
		$(".loginArea").show();
	});

	$(".registerText1, .goRegister").click(function() {
		hideLoginSets();
		$(".registerArea").show();
	});
	
	$(".loginText2, .goLogin").click(function() {
		hideLoginSets();
		$(".loginArea").show();
	});

	$(".personalCenterLogin").click(function() {
		hideLoginSets();
		$(".loginArea").show();
	});

	$(".closeLogin").click(function() {
		hideLoginSets();
		$(".loginArea").hide();
	});

	$(".personalCenterRegister").click(function() {
		hideLoginSets();
		$(".registerArea").show();
	});

	$(".closeRegister").click(function() {
		hideLoginSets();
		$(".registerArea").hide();
	});

	$(".closeforgetPwd").click(function() {
		hideLoginSets();
		$(".forgetPwdArea").hide();
	});

	$(".goForget").on("click", function() {
		hideLoginSets();
		$(".forgetPwdArea").show();
	});

	$(".forgetPwdBack").on("click", function() {
		hideLoginSets();
		$(".loginArea").show();
	});

	//忘记密码，发送验证码
	$(".forgetPwdCodeSend").on("click", function() {
		$(this).hide();
		$(".forgetPwdCodeSend2").show();
		$(".forgetPwdCodeSend2").text("7秒后重新发送");
		var loop = setInterval(function() {
			if (codeCount < 0) {
				$(".forgetPwdCodeSend").show();
				$(".forgetPwdCodeSend2").hide();
			} else {
				$(".forgetPwdCodeSend2").text(codeCount + "秒后重新发送");
			}
			codeCount--;
		}, 1000);
		if (codeCount < 0) {
			clearInterval(loop);
			codeCount = 6;
		}
	});
	
    //第三方登录
	$(".thirdPartyWeibo").on("click", function(){
		var w = window.open();
		$.ajax({
			type: "post",
			url: "app/user/thirdLogin/weibo",
			success: function(data){
				var url = $.parseJSON(data).data;
				w.location = url;
			}
		});
	});
	
	//登录
	$(".loginButton").click(function() {
		//$(".loginHint").show();

		var username = $("#loginName").val();
		var password = $("#loginPwd").val();
		var remMeBox = $("#remberMe").attr("class");
		var tempp = location.href;
		tempp = tempp.split(":")
		tempp = tempp[1].split("//")

		if (username != "" && username != null) {
			if (password != "" && password != null) {
				$.ajax({
					url: "/app/user/login",
					type: "POST",
					data: {
						email: username,
						password: password
					},
					xhrFields: {
						withCredentials: true
					},
					success: function(result, textStatus, jqXHR) {

						var data = jQuery.parseJSON(result).data;
						var error = jQuery.parseJSON(result).error;
						console.log(data);
						console.log(error);
						if (error != undefined) {
							//$(".loginHint").hide();
							$(".loginHint").css("visibility", "visible");
							$(".loginHintText").text(error.message);
						} else {
							var cookie = $.cookie("VLS_SESSION");
							if (!(remMeBox === "rembMeBox toggleCbSmall")) {
								$.cookie('VLS_SESSION', cookie, {
									domain: "."+tempp,
									path: '/'
								});
							}
							window.location.reload();
							//$(".chatContentInner").append("<p class='chatMsg'>" + _username + ", 欢迎您加入聊天室！</p>");
						}
					}
				});
			} else {
				popError2("密码不能为空");
			}
		} else {
			popError2("邮箱不能为空");
		}
	});

	$("#loginName, #loginPwd").on("focus", function() {
		$(".loginHint").css("visibility", "hidden");
	});

	//登出
	$(document).on("click", ".userLogout", function() {
		logout();
	});

	//进入个人中心
	$(document).on("click", ".userIconImg, .userIconText", function() {
		window.location = "http://vls.whonow.cn:8086/userProfile.html";
	});

	//注册
	$(".registerButton").click(function() {

		var nickname = $("#registerName").val();
		var password = $("#registerPwd").val();
		var sex = $(".registerSexSelection input:radio:checked").val();
		var email = $("#registerEmail").val();
		$.post("/app/user/register", {
				email: email,
				username: nickname,
				password: password,
				sex: sex
			},
			function(result) {
				var data = jQuery.parseJSON(result).data;
				var error = jQuery.parseJSON(result).error;
				if (error != undefined) {
					popError(error.message);
				} else {
					var name = data.user.nickname;
					loginSuccess(name);
				}
			});

	});

	//注册用户名是否重复检测
	$("#registerName").on("blur", function() {
		$.post("/app/user/username/check", {
				username: $("#registerName").val()
			},
			function(result) {
				var data = jQuery.parseJSON(result).data;
				var error = jQuery.parseJSON(result).error;
				console.debug(result);
				if (error == undefined) {
					$(".registerHint").css("visibility", "hidden");
				} else {
					popError(error.message);
				}
			});
	});

	//检测密码是否可用
	$("#registerPwd").on("blur", function() {
		var result = passwordCheck("#registerPwd");
		if (result != 1) {
			popError(result);
		}
	});

	//检测二次密码是否匹配
	$("#registerPwd2").on("blur", function() {
		var result = confirmPasswordCheck("#registerPwd2", "#registerPwd");
		if (result != 1) {
			popError(result);
		}
	});

	//注册邮箱是否重复检测
	$("#registerEmail").on("blur", function() {
		var result = emailCheck("#registerEmail");
		if (result == 1) {
			var txt = $("#registerPwd").val();
			$.post("/app/user/email/exist", {
					email: txt
				},
				function(result) {
					var data = jQuery.parseJSON(result).data;
					if (data.isExist == true) {
						popError("邮箱已经被注册");
					}
				});
		} else {
			popError(result);
		}
	});

	//聊天功能
	$(".sendBtn").click(function() {
		$.ajax({
			type:"post",
			url:"/app/user/isLogin",
			success: function(data){
				var isLogin = JSON.parse(data);
				isLogin = isLogin.data;
				if(!isLogin){
					showLogin();
				} else {
					var content = $(".chatInputAreaInner input").val();
					//console.log(content);
					if (content == "" || content == undefined) {
						showMsgAlert("请输入有效信息！");
					} else {
						var time = getTime();
						userChatContent = content;
						send(userChatContent);
						scrollToBottom();
						$(".chatInputAreaInner input").val("");
					}
				}
			}
		});
	});

	$(".chatInputAreaInner input").on("keypress", function(e) {
		var code = e.keyCode || e.which;
		if (code == 13) {
			$.ajax({
				type:"post",
				url:"/app/user/isLogin",
				success: function(data){
					var isLogin = JSON.parse(data);
					isLogin = isLogin.data;
					if(!isLogin){
						showLogin();
					} else {
						var content = $(".chatInputAreaInner input").val();
						//console.log(content);
						if (content == "" || content == undefined) {
							showMsgAlert("请输入有效信息！");
						} else {
							var time = getTime();
							userChatContent = content;
							send(userChatContent);
							scrollToBottom();
							$(".chatInputAreaInner input").val("");
						}
					}
				}
			});
		}
	});

	//分享链接
	$(".weiboShare").on("click", function() {
		var url = "http://vls.whonow.cn:8086/index";
		var title = "纸巾TV";
		var summary = "让你撸到HIGH的TV";
		var content = "让你撸到HIGH的TV";
		var img = "http://vls.whonow.cn:8086/img/xc.jpg";
		window.open("http://service.weibo.com/share/share.php?title=" + title + " " + content + "&url=" + url + "&pic=" + img + "&ralateUid=");
	});

	$(".qqZoneShare").on("click", function() {
		var url = "http://vls.whonow.cn:8086/index";
		var title = "纸巾TV";
		var summary = "让你撸到HIGH的TV";
		var content = "让你撸到HIGH的TV";
		var img = "http://vls.whonow.cn:8086/img/xc.jpg";
		window.open("http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=" + url + "&title=" + title + "&pics=" + img + "&summary=" + summary);
	});

	$(".qqShare").on(function() {
		var url = "http://vls.whonow.cn:8086/index";
		var title = "纸巾TV";
		var summary = "让你撸到HIGH的TV";
		var content = "让你撸到HIGH的TV";
		var img = "http://vls.whonow.cn:8086/img/xc.jpg";
		window.open("http://connect.qq.com/widget/shareqq/index.html?url=" + url + "&showcount=0&desc=" + title + " " + content + "&summary=" + title + " " + content + "&title=" + title + "&site=纸巾TV&pics=" + img);
	});

	$(".moreSharesText").on("click", function() {
		var name = $(this).data("sharename");
		var url = "http://vls.whonow.cn:8086/index";
		var title = "纸巾TV";
		var summary = "让你撸到HIGH的TV";
		var content = "让你撸到HIGH的TV";
		var img = "http://vls.whonow.cn:8086/img/xc.jpg";
		switch (name) {
			case "xlwb":
				window.open("http://service.weibo.com/share/share.php?title=" + title + " " + content + "&url=" + url + "&pic=" + img + "&ralateUid=");
				break;
			case "txwb":
				window.open("http://share.v.t.qq.com/index.php?c=share&a=index&title=" + title + " " + content + "&url=" + url + "&pic=" + img);
				break;
			case "qq":
				window.open("http://connect.qq.com/widget/shareqq/index.html?url=" + url + "&showcount=0&desc=" + title + " " + content + "&summary=" + title + " " + content + "&title=" + title + "&site=纸巾TV&pics=" + img);
				break;
			case "qqkj":
				window.open("http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=" + url + "&title=" + title + "&pics=" + img + "&summary=" + summary);
				break;
			case "rr":
				window.open("http://widget.renren.com/dialog/share?resourceUrl=" + url + "&srcUrl=" + url + "&title=" + title + "&pic=" + img + "&description=" + content);
				break;
			case "txpy":
				window.open("http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?to=pengyou&url=" + url + "&title=" + title + "&summary=" + content + "&pics=" + img);
				break;
			case "bdtb":
				window.open("http://tieba.baidu.com/f/commit/share/openShareApi?title=" + title + "&desc=" + content + "&comment=&pic=" + img + "&url=" + url);
				break;
			case "db":
				window.open("http://www.douban.com/share/service?image=" + img + "&href=" + url + "&name=" + title + "&text=" + content);
				break;
			case "tysq":
				window.open("http://open.tianya.cn/widget/send_for.php?action=send-html&shareTo=1&title=" + title + "&url=" + url + "&picUrl=" + img);
				break;
			case "kxw":
				window.open("http://www.kaixin001.com/login/open_login.php?flag=1&url=/rest/records.php?content=" + title + " " + content + "&url=" + url + "&starid=&aid=100018706&style=11&pic=" + img);
				break;
		}
	});

	//功能区
	function setChatHeight() {
		var a1 = 210;
		var a2 = $("#chatUpdate").height();
		var a3 = $("#chat").height();
		var a4 = $(window).height();
		var a5 = a4 - a3 - a2 - a1;
		$(".chatContent").height(a5);
	}

	function setChatHeight2() {
		var a1 = 0;
		var a2 = $("#chatUpdate").height();
		var a3 = $("#chat").height();
		var a4 = $(window).height();
		var a5 = a4 - a3 - a2 - a1;
		$(".chatContent").height(a5);
	}

	function updatePreview(c) {
		if (parseInt(c.w) > 0) {
			var rx = xsize / c.w;
			var ry = ysize / c.h;

			$pimg.css({
				width: Math.round(rx * boundx) + 'px',
				height: Math.round(ry * boundy) + 'px',
				marginLeft: '-' + Math.round(rx * c.x) + 'px',
				marginTop: '-' + Math.round(ry * c.y) + 'px'
			});
		}
	}

	function makeAndOldQuest() {
		if ($(".questTypeSelection2").attr("checked")) {
			$(".answerDescription").hide();
		} else if ($(".questTypeSelection1").attr("checked")) {
			$(".answerDescription").show();
		}
	}

	function hoverIn(a) {
		$(a).stop(true, true).fadeIn(100);
	}

	function hoverOut(a) {
		$(a).stop(true, true).fadeOut(100);
	}

	function generateUserBirthdayOptions() {
		for (var i = 1900; i <= 2014; i++) {
			$(".userBirthday select:nth-child(1)").append("<option >" + i + "</option>");
		}
		for (var i = 1; i <= 12; i++) {
			$(".userBirthday select:nth-child(2)").append("<option>" + i + "</option>");
		}
		for (var i = 1; i <= 31; i++) {
			$(".userBirthday select:nth-child(3)").append("<option>" + i + "</option>");
		}
	}

	function smartStage(width) {
		if (width <= 1000) {
			triggerStageMod1();
		} else if (width > 1000 && width < 1900) {
			triggerStageMod2();
		} else {
			triggerStageMod3();
		}
	}

	function triggerStageMod1() {
		$(".actorStage").css("width", "400px");
		stageImgPositionReset();
	}

	function triggerStageMod2() {
		$(".actorStage").css("width", "960px");
		stageImgPositionReset();
		$(".actor2").css({
			"position": "absolute",
			"top": "-60px",
			"left": "560px"
		});
		$(".actor4").css({
			"position": "absolute",
			"top": "676px",
			"left": "560px"
		});
	}

	function triggerStageMod3() {
		$(".actorStage").css("width", "1750px");
		stageImgPositionReset();
		$(".actor2").css({
			"position": "absolute",
			"top": "-60px",
			"left": "450px"
		});
		$(".actor3").css({
			"position": "absolute",
			"top": "-60px",
			"left": "900px"
		});
		$(".actor4").css({
			"position": "absolute",
			"top": "-60px",
			"left": "1350px"
		});
	}

	function stageImgPositionReset() {
		$(".actor1").css("position", "static");
		$(".actor2").css("position", "static");
		$(".actor3").css("position", "static");
		$(".actor4").css("position", "static");
	}

	function initStageMod() {
		var stageW = $("#container").width();
		smartStage(stageW);
	}

	function scaleSwitchLeft() {
		var $left = $("#left").css("display");
		if ($left == "none") {
			$("#left").fadeIn(0);
			$("#miniLeft").fadeOut(0);
			setContainerSize();
			$("#leftScale").css("left", "239px");
			$("#leftScale").css("background", scaleSwitchImg[0]);
			$("#leftScale").on({
				mouseenter: function() {
					$("#leftScale").css("background", scaleSwitchImg[4]);
				},
				mouseleave: function() {
					$("#leftScale").css("background", scaleSwitchImg[0]);
				}
			});
		} else {
			$("#left").fadeOut(0);
			$("#miniLeft").fadeIn(0);
			setContainerSize();
			$("#leftScale").css("left", "71px");
			$("#leftScale").css("background", scaleSwitchImg[1]);
			$("#leftScale").on({
				mouseenter: function() {
					$("#leftScale").css("background", scaleSwitchImg[5]);
				},
				mouseleave: function() {
					$("#leftScale").css("background", scaleSwitchImg[1]);
				}
			});
		}
	}

	function scaleSwitchRight() {
		var $right = $("#right").css("display");
		if ($right == "none") {
			$("#right").fadeIn(0);
			setContainerSize();
			$("#rightScale").css("right", "340px");
			$("#rightScale").css("background", scaleSwitchImg[3]);
			$("#rightScale").on({
				mouseenter: function() {
					$("#rightScale").css("background", scaleSwitchImg[7]);
				},
				mouseleave: function() {
					$("#rightScale").css("background", scaleSwitchImg[3]);
				}
			});
		} else {
			$("#right").fadeOut(0);
			setContainerSize();
			$("#rightScale").css("right", "0");
			$("#rightScale").css("background", scaleSwitchImg[2]);
			$("#rightScale").on({
				mouseenter: function() {
					$("#rightScale").css("background", scaleSwitchImg[6]);
				},
				mouseleave: function() {
					$("#rightScale").css("background", scaleSwitchImg[2]);
				}
			});
		}
	}


	function checkIsScale() {
		if (isScale1 == 0 && isScale2 == 0) {
			initContainerSize();
		} else {
			setContainerSize();
		}
	}

	function initContainerSize() {
		var width = $(window).width();
		if (width <= 990) {
			$("#left").hide();
			$("#miniLeft").show();
			$("#right").hide();
			$("#container").css("margin", "0 5px 0 80px");
		} else if (width >= 990 && width <= 1150) {
			$("#left").hide();
			$("#miniLeft").show();
			$("#right").show();
			$("#container").css("margin", "0 345px 0 80px");
		} else if (width > 1150) {
			$("#left").show();
			$("#miniLeft").hide();
			$("#right").show();
			$("#container").css("margin", "0 345px 0 245px");
		}
		setScaleSwitchPosition();
	}

	function loginSuccess(name) {
		$(".loginArea").hide();
		$(".registerArea").hide();
		//alert(data.nickname);
		$(".personalCenterRegister, .personalCenterLogin").hide();
		//      $(".userIn").text("Welcome, " + name);
		//      $(".userIn").show();
		window.location.reload();
	}

	function setOriginalLayout() {
		$("#left").show();
		$("#right").show();
		$("#miniLeft").hide();
		$("#container").css("margin", "0 340px 0 245px");
		$("#leftScale").css("left", "239px");
		$("#rightScale").css("right", "340px");
	}

	function setContainerSize() {
		var $left = $("#left").css("display");
		var $right = $("#right").css("display");
		if ($left == "none" && $right != "none") {
			$("#container").css("margin", "0 340px 0 80px");
			console.log("minileft and right");
		} else if ($left != "none" && $right == "none") {
			$("#container").css("margin", "0 0 0 245px");
			console.log("left");
		} else if ($left == "none" && $right == "none") {
			$("#container").css("margin", "0 0 0 80px");
			console.log("minileft");
		} else {
			$("#container").css("margin", "0 340px 0 245px");
			console.log("left and right");
		}
	}

	function setScaleSwitchPosition() {
		var $left = $("#left").css("display");
		if ($left == "none") {
			$("#leftScale").css("left", "72px");
			$("#leftScale").css("background", scaleSwitchImg[1]);
			$("#leftScale").on({
				mouseenter: function() {
					$("#leftScale").css("background", scaleSwitchImg[5]);
				},
				mouseleave: function() {
					$("#leftScale").css("background", scaleSwitchImg[1]);
				}
			});
		} else {
			$("#leftScale").css("left", "239px");
			$("#leftScale").css("background", scaleSwitchImg[0]);
			$("#leftScale").on({
				mouseenter: function() {
					$("#leftScale").css("background", scaleSwitchImg[4]);
				},
				mouseleave: function() {
					$("#leftScale").css("background", scaleSwitchImg[0]);
				}
			});
		}
		var $right = $("#right").css("display");
		if ($right == "none") {
			$("#rightScale").css("right", "0");
			$("#rightScale").css("background", scaleSwitchImg[2]);
			$("#rightScale").on({
				mouseenter: function() {
					$("#rightScale").css("background", scaleSwitchImg[6]);
				},
				mouseleave: function() {
					$("#rightScale").css("background", scaleSwitchImg[2]);
				}
			});
		} else {
			$("#rightScale").css("right", "340px");
			$("#rightScale").css("background", scaleSwitchImg[3]);
			$("#rightScale").on({
				mouseenter: function() {
					$("#rightScale").css("background", scaleSwitchImg[7]);
				},
				mouseleave: function() {
					$("#rightScale").css("background", scaleSwitchImg[3]);
				}
			});
		}
	}

	function chatLoading() {
		$(".chatLoading").myBlink();
	}

	function getTime() {
		var time = new Date();
		var hour = time.getHours();
		var min = time.getMinutes();
		time = hour.toString() + ":" + min.toString();
		return time;
	}

	function scrollToBottom() {
		if ($(".chatContentContainer").height() > $(".chatContentInner").height()) {
			$(".chatContentContainer").css("bottom", "auto");
		}

		$('.chatContentInner').scrollTop($('.chatContentInner')[0].scrollHeight);
	}

	function checkCookies() {
		var keys = document.cookie.match(/[^ =]+(?=\=)/g);
		if (keys == null) {
			return false;
		} else {
			return true;
		}
	}

	function getCookie(name) {
		function escape(s) {
			return s.replace(/([.*+?\^${}()|\[\]\/\\])/g, '\\$1');
		};
		var match = document.cookie.match(RegExp('(?:^|;\\s*)' + escape(name) + '=([^;]*)'));
		return match ? match[1] : null;
	}

	function logout() {
		$.ajax({
			url: "/app/user/logout",
			type: "POST",
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				window.location.reload();
			}
		});
	}

	function setVideoHeight() {
		var w = $("#liveStreamVideo").width();
		var h = Math.floor(w / 16 * 9);
		$("#liveStreamVideo").height(h);
	}

	function giftBarCheck() {
		var a = Math.abs(gBarLeft1);
		var b = $(".giftBarMiddle").width();
		var c = $(".giftsWrapper").width();
		if (a == 0) {
			$(".giftBarLeftArrow").hide();
		} else {
			$(".giftBarLeftArrow").show();
		}
		if ((a + b) >= c) {
			$(".giftBarRightArrow").hide();
		} else {
			$(".giftBarRightArrow").show();
		}
	}

	function toolBarCheck() {
		var a = Math.abs(gBarLeft2);
		var b = $(".toolBarMiddle").width();
		var c = $(".toolsWrapper").width();
		if (a == 0) {
			$(".toolBarLeftArrow").hide();
		} else {
			$(".toolBarLeftArrow").show();
		}
		if ((a + b) >= c) {
			$(".toolBarRightArrow").hide();
		} else {
			$(".toolBarRightArrow").show();
		}
		if (b > c) {
			$(".toolBarLeftArrow").hide();
			$(".toolBarRightArrow").hide();
		}
	}

	function usernameCheck(a) {
		var value = $(a).val();
		var reg = /^[A-Za-z0-9\u4e00-\u9fa5]+$/;
		if (value != "" && value != null) {
			if (!reg.test(value)) {
				return "用户名只能为中文、数字或字母";
			}
		} else {
			return "用户名不能为空";
		}
	}

	function passwordCheck(a) {
		var value = $(a).val();
		var reg = /^\S{6,13}$/;
		if (value != "" && value != null) {
			if (reg.test(value)) {
				return 1;
			} else {
				return "密码只能在6-13位之间且不能包含空格";
			}
		} else {
			return "密码不能为空";
		}
	}

	function confirmPasswordCheck(a, b) {
		var value1 = $(a).val();
		var value2 = $(b).val();
		var reg = /^\S{6,13}$/;
		if (value1 != "" && value1 != null) {
			if (value1 === value2) {
				if (reg.test(value1)) {
					return 1;
				} else {
					return "密码只能在6-13位之间且不能包含空格";
				}
			} else {
				return "两次密码不一致";
			}
		} else {
			return "确认密码不能为空";
		}
	}

	function emailCheck(a) {
		var value = $(a).val();
		var reg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
		if (value != "" && value != null) {
			if (reg.test(value)) {
				return 1;
			} else {
				return "邮箱格式不正确";
			}
		} else {
			console.log(value);
			return "邮箱不能为空";
		}
	}

	function rulesCheck(a, b) {
		if ($(a).hasClass(b)) {
			return 1;
		} else {
			return "请同意服务协议";
		}
	}

	function registerCheck(o, p, q, r, s, t) {
		var a = usernameCheck(o);
		var b = passwordCheck(p);
		var c = confirmPasswordCheck(q, p);
		var d = emailCheck(r);
		var e = rulesCheck(s, t);
		var sum = a + b + c + d + e;
		if (sum == 5) {
			return true;
		} else {
			return false;
		}
	}

	function popError(a) {
		$(".registerHint").css("visibility", "visible");
		$(".registerHintText").text(a);
	}

	function popError2(a) {
		$(".loginHint").css("visibility", "visible");
		$(".loginHintText").text(a);
	}

	function hideLoginSets() {
		$(".loginArea, .registerArea, .forgetPwdArea").hide();
	}

	function pageSwitch(name) {
		switch (name) {
			case "正在直播":
				window.location = "/index";
				break;
			case "往期回顾":
				window.location = "/history/index";
				break;
			case "选手嘉宾":
				window.location = "/actor/index";
				break;
			case "充值中心":
				window.location = "/user/topup";
				break;
			case "任务中心":
				window.location = "/taskCenter.html";
				//$(".appDownload").slideToggle(200);
				//toggleAppDownload();
				break;
			default:

		}
	}

	function toggleAppDownload() {
		if (!isAppDownload) {
			$(".appDownloadWrapper").animate({
				top: -360
			});
			isAppDownload = true;
		} else {
			$(".appDownloadWrapper").animate({
				top: 0
			});
			isAppDownload = false;
		}
	}

});

function milliFormat(num) { //添加千位符
	num = num + "";
	var re = /(-?\d+)(\d{3})/;
	while (re.test(num)) {
		num = num.replace(re, "$1,$2");
	}
	return num;
}

function getUserBal() {
	$.ajax({
		type: "get",
		url: "/app/user/myInfo",
		xhrFields: {
			withCredentials: true
		},
		success: function(data) {
			var a = JSON.parse(data);
			//console.log(a);
			var money = a.data.user.money;
			var avatar = a.data.user.avatarUri;
			$("#userBalanceAmount").text(money + "G");
			$(".userIconImg").css({
				"background": "url(" + avatar + ") no-repeat 0 0",
				"background-size": "cover"
			});
		}
	});
}

function updateFansList() {
	//  $(".allFans").html("");
	//  $.ajax({
	//      type: "get",
	//      url: "/app/product/getFansPops",
	//      data: {roomId: _defaultRoomId},
	//      success: function (data) {
	//          var json = JSON.parse(data);
	//          var jsonArray = json.data.consumes;
	//          var userId = [];
	//          var userName = [];
	//          var userCount = [];
	//          var userAvatar = [];
	//          //console.log(data);
	//          for (var i = 0; i < jsonArray.length; i++) {
	//              userId.push(jsonArray[i].userId);
	//              userCount.push(jsonArray[i].pops);
	//          }
	//          for (var i = 0; i < userId.length; i++) {
	//              var id = userId[i];
	//              $.ajax({
	//                  type: "get",
	//                  url: "/app/user/findUserByUid",
	//                  data: {uid: id},
	//                  async: false,
	//                  success: function (data) {
	//                      var j = JSON.parse(data);
	//                      var ja = j.data.user;
	//                      var rankSpec = '">' + (i + 1);
	//                      if ((i + 1) == 1) {
	//                          rankSpec = ' singleFanRank1">';
	//                      } else if ((i + 1) == 2) {
	//                          rankSpec = ' singleFanRank2">' + (i + 1);
	//                      } else if ((i + 1) == 3) {
	//                          rankSpec = ' singleFanRank3">' + (i + 1);
	//                      }
	//                      $(".allFans").append(
	//                          '<div class="singleFan singleFan' + (i + 1) + '">' +
	//                          '<div class="singleFanRank' + rankSpec + '</div>' +
	//                          '<div class="singleFanImg">' +
	//                          '<img src="' + ja.avatarUri + '"/></div>' +
	//                          '<div class="singleFanName">' + ja.username + '</div>' +
	//                          '<div class="singleFanScore">' + userCount[i] + '</div>' +
	//                          '</div>'
	//                      );
	//                  }
	//              });
	//          }
	//      }
	//  });
}

function notLogin() {
	if (_username == "" || _username == undefined) {
		return true;
	} else {
		return false;
	}
}

//detect wether login or not
function detectLogin(){
	var jqHXR = $.ajax({
		type:"post",
		url:"/app/user/isLogin",
		async: false
	});
	var value = jqHXR.responseText;
	value = JSON.parse(value).data;
	return value;
}

function showLogin() {
	$(".loginArea").show();
}

function showMsgAlert(a) {
	$(".balAlertText").text(a);
	$(".msgAlert").show();
}

function readActorScore() {
	$.ajax({
		type: "get",
		url: "/app/room/getActors",
		data: {
			roomId: _defaultRoomId
		},
		success: function(data) {
			//console.debug(data);
			var a = JSON.parse(data);
			a = a.data.actors;
			for (var i = 0; i < 4; i++) {
				$(".actorLists2 .actorRank" + (i + 1) + " .actorListNameImg .actorListImg img").attr("src", a[i].avatar);
				$(".actorLists2 .actorRank" + (i + 1) + " .actorListNameImg .actorListName").text(a[i].name);
				$(".actorLists2 .actorRank" + (i + 1) + " .actorListScore").text(a[i].score);
			}
		}
	});
}

function js_not_login(){
	showLogin();
}
