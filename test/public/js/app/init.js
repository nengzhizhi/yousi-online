$(function () {
    //todo 后期从前一个页面传roomId过来
    _defaultRoomId = "544e007ab99a88bc8b6c401e";
    if ($.cookie("VLS_SESSION")) {
        var cookie = $.cookie("VLS_SESSION");
        cookie = encodeURIComponent(cookie);
        cookie = cookie.split("%00%00")[1];
        cookie = decodeURIComponent(cookie);
        cookie = cookie.split(":")[1];
        _username = cookie;
        if (cookie != undefined) {
            var login = ' <div class="logoDivid"></div><div class="userIn" style="display: block;"><div class="userIconImg"></div><div class="userIconText">个人中心</div><div class="userLogout">退出</div></div>';
            $("#personalCenter").html(login);
            $(".userBalance").show();
            $(".miniLeftInfoPersonal .miniLeftInfoText").text("个人中心");
            getUserBal();
        }
    }

    /**
     * 更新粉丝榜
     */
    updateFansList();

    /**
     * 获取节目信息
     */
    $.ajax({
    	type: "get",
    	url: "/app/activity/getItemByRoomId",
    	data: { roomId: _defaultRoomId },
    	async: false,
    	success: function(result){
    		var data = jQuery.parseJSON(result).data;
            var roomId = _defaultRoomId;
            var activityName = data.activityName;
            var playingDate = data.playingDate.split(" ")[0].replace(/-/g, "");
            var state = data.state;
            var chaturl = data.wsServerUrl;
            var sponsor = data.sponsor;
            var remainingTime = data.remainingTime;
            var email = data.email;
            var type = data.individual;
            var activityLogo = data.activityLogo;
            var actors = data.actors;
            var html = '<div class="videoTitleName">' + activityName + ' <p class="videoDate">第' + playingDate + '期</p> </div> <div class="actorName"> </div>';
            chatComm(roomId, chaturl, state, sponsor, remainingTime,data.playingDate);
            $(".videoTitle").html(html);
            var names = "";
            for (var i = 0; i < actors.length; i++) {
            	$.ajax({
            		type: "get",
            		url: "/admin/activity/getActor",
            		async: false,
            		data: { actorId: actors[i].actorId },
            		success: function(actor){
            			var data = jQuery.parseJSON(actor).data;
                        names += data.name + "、";
                        var html = '<div class="toolSendToLists toolSendToList' + (i + 1) + '">' + data.name + '</div>';
                        $(".toolSendToList").append(html);
                        var html = '<div data-actorId=' + data.actorId + ' class="giftSendToLists giftSendToList' + (i + 1) + '">' + data.name + '</div>';
                        $(".giftSendToList").append(html);
                        var html = '<div class="actor actor' + (i + 1) + '">' +
                            '<div class="actorShowImg" style="background:url(\'' + data.images[0] + '\'); background-size: 100% 100%;">' +
                            '<div class="actorMoreInfo"><span>了解更多</span></div></div>' +
                            '<table><tr><td>姓名：<span>' + data.name + '</span></td>' +
                            '<td>生日：<span>' + data.birthday + '</span></td></tr><tr>' +
                            '<td>来自：<span>' + data.city + '</span></td>' +
                            '<td>身高：<span>' + data.height + 'cm</span></td>' +
                            '</tr><tr><td>星座：<span>' + data.star + '</span></td>' +
                            '<td>三围：<span>' + data.chest + '-' + data.waist + '-' + data.hip + '</span></td></tr></table></div>';
                        $(".actorStage").append(html);
            		}
            	});
            }
            $(".actorName").html("本期选手: " + names.substring(0, names.length - 1));
            $(".actorImg img").attr("src", activityLogo);
    	}
    });
//  $.get("/app/activity/getItemByRoomId", 
//  	{ roomId: _defaultRoomId },
//      function (result) {
//          var data = jQuery.parseJSON(result).data;
//          var roomId = _defaultRoomId;
//          var activityName = data.activityName;
//          var playingDate = data.playingDate.split(" ")[0].replace(/-/g, "");
//          var state = data.state;
//          var chaturl = data.wsServerUrl;
//          var sponsor = data.sponsor;
//          var remainingTime = data.remainingTime;
//          var email = data.email;
//          var type = data.individual;
//          var activityLogo = data.activityLogo;
//          var actors = data.actors;
//          var html = '<div class="videoTitleName">' + activityName + ' <p class="videoDate">第' + playingDate + '期</p> </div> <div class="actorName"> </div>';
//          chatComm(roomId, chaturl, state, sponsor, remainingTime);
//          $(".videoTitle").html(html);
//          var names = "";
//          for (var i = 0; i < actors.length; i++) {
//              $.get("/admin/activity/getActor", 
//              	{ actorId: actors[i].actorId },
//                  function (actor) {
//                      var data = jQuery.parseJSON(actor).data;
//                      names += data.name + "、";
//                      var html = '<div class="toolSendToLists toolSendToList' + (i + 1) + '">' + data.name + '</div>';
//                      $(".toolSendToList").append(html);
//                      var html = '<div data-actorId=' + data.actorId + ' class="giftSendToLists giftSendToList' + (i + 1) + '">' + data.name + '</div>';
//                      $(".giftSendToList").append(html);
//                      var html = '<div class="actor actor' + (i + 1) + '">' +
//                          '<div class="actorShowImg" style="background:url(\'' + data.images[0] + '\'); background-size: 100% 100%;">' +
//                          '<div class="actorMoreInfo"><span>了解更多</span></div></div>' +
//                          '<table><tr><td>姓名：<span>' + data.name + '</span></td>' +
//                          '<td>生日：<span>' + data.birthday + '</span></td></tr><tr>' +
//                          '<td>来自：<span>' + data.city + '</span></td>' +
//                          '<td>身高：<span>' + data.height + 'cm</span></td>' +
//                          '</tr><tr><td>星座：<span>' + data.star + '</span></td>' +
//                          '<td>三围：<span>' + data.chest + '-' + data.waist + '-' + data.hip + '</span></td></tr></table></div>';
//                      $(".actorStage").append(html);
//                  }
//              );
//          }
//          $(".actorName").html("本期选手:" + names.substring(0, names.length - 1));
//
//      });


    /**
     * 获取所有道具
     */
//  $.get("/app/product/getAllTools", {},
//      function (result) {
//          var data = jQuery.parseJSON(result).data;
//          var tools = data.tools;
//          var toolsLen = tools.length;
//          for (var i = 0; i < toolsLen; i++) {
//              var tool = tools[i];
//
//              var html = '<div class="toolCards"> <table><tr><td><div class="toolCardTest" data-price="'+tool.price+'" data-productId="'+tool.productId+'"style="background:url(\'' + tool.pictureForWeb + '\') repeat scroll 0 0 rgba(0, 0, 0, 0)"><div class="toolCardChecked"></div></div></td></tr><tr><td><div class="toolCardText"><span class="toolCardText1">' + tool.name + '</span></div></td></tr><tr><td><span class="toolCardText2">' + tool.price + 'G</span></td></tr></table></div>';
//              $(".toolsWrapper").append(html);
//          }
//      });

    /**
     * 获取所有礼物
     */

    $.get("/app/gift/findAllGifts", {},
        function (result) {
            var data = jQuery.parseJSON(result).data;
            var gifts = data.gifts;
            var giftsLen = gifts.length;
            $(".giftsWrapper").width(giftsLen * 85);
            for (var i = 0; i < giftsLen; i++) {
                var gift = gifts[i];
//              var html = '<div class="giftCards"><table><tr> <td><div class="giftCardTest" data-price="'+gift.price+'"  data-productId="'+
//                  gift.productId+'" style="background:url(\'' + gift.pictureForWeb + '\') repeat scroll 0 0 rgba(0, 0, 0, 0)"><div class="giftCardChecked"></div></div></td></tr><tr><td><div class="giftCardText"><span class="giftCardText1">' + gift.name + '</span></div></td> </tr><tr><td><span class="giftCardText2">' + gift.price + 'G</span></td></tr></table></div>';
                var html = '<div class="giftCards">' +
                    '<div class="giftCardsImgWrapper data-price="' + gift.price + '"  data-productId="' + gift.giftId + '" data-select="false">' +
                    '<div class="giftCardsImg">' +
                    '<img src="' + gift.pngForWeb + '">' +
                    '</div>' +
                    '</div>' +
                    '<div class="giftCardsPrice">' + gift.price + 'G</div>' +
                    '</div>';
                $(".giftsWrapper").append(html);
            }

        });

    /**
     * 获取选手积分
     */

    $.ajax({
        type: "get",
        url: "/app/room/showSitePop",
        data: {roomId: _defaultRoomId},
        success: function (data) {
            console.log(data);
            var a = JSON.parse(data);
            a = a.data.initList;
            sortActorList(a);
        }
    });

});
