$(function(){
	var validatePay = false;
	var payId;
	payValidation();
	
	if(detectLogin()){
		$.ajax({
			type:"get",
			url: "/app/user/myInfo",
			xhrFields: { withCredentials: true },
			sync: false,
			success: function(data){
				var value = JSON.parse(data);
				var user = value.data.user;
				var	name = user.email;
				$(".topupUsernameInput").val(name);
			}
		});	
	}
		
	$(".topupInputClear").on("click", function(){
		$(this).siblings("input").val("");
		payValidation();
	});
	
	$(".topupAmountReset").on("click", function(){
		$(".topupTotal-real").text("0.00元");
		$(".topupTotal-virtual").text("(0G)");
		payValidation();
	});
	
	$(".topupAmountInput").on("keydown", function (e) {
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13]) !== -1 ||
            (e.keyCode == 65 && e.ctrlKey === true) ||
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            return;
        }
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
        payValidation();
    });
    
    $(".topupAmountInput").on("keyup", function () {
    	var price = parseInt($(this).val());
    	$.ajax({
    		type: "get",
    		url: "/app/pay/rebate/getPercent",
    		async: false,
    		data: {price: price},
    		success: function(data){
    			if(JSON.parse(data).hasOwnProperty("data")){
    				var bargin = JSON.parse(data).data.percent;
    				var price2 = price*bargin;
    				$(".topupTotal-real").text(price2.toFixed(2)+"元");
			$(".topupTotal-virtual").text("("+price*100+"G)");
    			}else{
    				var msg = JSON.parse(data).error.message;
    				console.log(msg);
    			}
    		}
    	});
    	if(!isNaN(price)){	
    	}
    	payValidation();
    });
    
    $(".topupPriceBlock li").on("click", function(){
    	$(".topupPriceSelect").hide();
    	$(this).children(".topupPriceSelect").show();
    	payValidation();
    });
    
    $(".topupBy li").on("click", function(){
    	$(".topupBySelect").hide();
    	$(this).children(".topupBySelect").show();
    	$(".topupBy").data("by", $(this).children(".topupBySelect").data("by"))
    	payValidation();
    });
	
	$(".topupRuleCheckbox").on("click", function(){
		$(this).toggleClass("topupRuleCheckboxUn");
		payValidation();
	});
	
	$(".topupPriceBlock li").on("click", function(){
		var price = $(this).text();
		var bargin = $(this).data("bargin");
		price = parseInt(price);
		bargin==undefined ? bargin=1 : bargin;
		$(".topupTotal-real").text((price*bargin).toFixed(2)+"元");
		$(".topupTotal-virtual").text("("+price*100+"G)");
		$(".topupAmountInput").val("");
		payValidation();
	});
	
	$(".topupUsernameInput").focus(function(){
		$(this).parent().css("border", "1px solid #00beea");
		payValidation();
	});
	
	$(".topupUsernameInput").blur(function(){
		$(this).parent().css("border", "1px solid #eaeaea");
		payValidation();
	});
	
	$(".topupAmountInput").focus(function(){
		$(this).parent().css("border", "1px solid #00beea");
//		$(".topupTotal-real").text("0.00元");
//		$(".topupTotal-virtual").text("(0G)");
		$(".topupPriceSelect").hide();
		payValidation();
	});
	
	$(".topupAmountInput").blur(function(){
		$(this).parent().css("border", "1px solid #eaeaea");
//		if($(this).val()!=""&&$(this).val()!=undefined&&$(this).val()!=null){
//			
//		}
		payValidation();
	});
	
	$(".topupButton").on("click", function(){
		if(validatePay){
			var pay = false;
			var payUrl = "";
			var username = $(".topupUsernameInput").val();
			var price = $(".topupAmountInput").val();
			var topupBy = $(".topupBy").data("by");
			$.ajax({
				type: "post",
				url: "/app/pay/create",
				data: {
					email: username,
					payWay: topupBy,
					realityPrice: price
				},
				async: false,
				success: function(data){
					console.log(data);
					if($.parseJSON(data).hasOwnProperty("data")){
						pay = true;
						payUrl = $.parseJSON(data).data.url;
						payId = $.parseJSON(data).data.payId;
					}else{
						alert($.parseJSON(data).error.message);
					}
				}
			});
			if(pay){
				window.open(payUrl);
				$(".myModal-topup-pending").show();
				$("body").css("overflow","hidden");
			}
		}
	});
	
	$(".modal-close").on("click", function(){
    	$(this).parents().find(".myModal").hide();
    	$("body").css("overflow","visible");
    	payValidation();
    });
    
    $(".topup-modal-pending-finish").on("click", function(){
    	$.ajax({
    		type:"get",
    		url:"/app/pay/getPayStatusByPayId",
    		data: { payId: payId },
    		success: function(data){
    			alert(JSON.parse(data).data.payStatus);
    			$(".myModal").hide();
    			$("body").css("overflow","visible");
    		}
    	});
    });
    
    $(".topup-results-btnL").on("click", function(){
    	window.location = "topup";
    });
    
    $(".topup-modal-pending-re").on("click", function(){
    	$(".myModal").hide();
    	$("body").css("overflow","visible");
    });
    
    function forcePay(){
    	$(".topupButton").css({
			"background": "url(../img/topup/topup.png) no-repeat -270px -82px",
			"cursor": "default"
		});
		validatePay = false;
    }
    
    function releasePay(){
    	$(".topupButton").css({
			"background": "url(../img/topup/topup.png) no-repeat -140px -82px",
			"cursor": "pointer"
		});
    }
    
    function payValidation(){
    	var username = $(".topupUsernameInput").val();
		var price = parseInt($(".topupTotal-real").text());
		var topupBy = $(".topupBy").data("by");
		var checkBoxChecked = function(){
			if($(".topupRuleCheckbox").hasClass("topupRuleCheckboxUn")){
				return false;
			}else{
				return true;
			}
		}
		if(checkBoxChecked()){
			if(username!=""){
				if(price!=0){
					if(topupBy!="none"){
						//OK, topup GO GO GO!!!
						console.log("充值账号： "+username);
						console.log("充值金额： "+price);
						console.log("充值方式： "+topupBy);
						releasePay();
						validatePay = true;
					}else{
						console.log("请选择支付方式");
						forcePay();
					}
				}else{
					console.log("请输入充值金额");
					forcePay();
				}
			}else{
				console.log("请输入充值账号");
				forcePay();
			}
		}else{
			console.log("请同意服务条款");
			forcePay();
		}
    }
   
});
