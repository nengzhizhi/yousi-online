$(function(){
	$(".userProfile-contents-right-table tr:odd").css("background-color", "#F5F5F5");

	$(".userProfile-modal-repay-topupBy li").on("click", function(){
    	$(".topupBySelect").hide();
    	$(this).children(".topupBySelect").show();
    	$(".topupBy").data("by", $(this).children(".topupBySelect").data("by"))
    });
    
    $(".userProfile-contents-right-table-pay").on("click", function(){
    	var value = $(this).parent().siblings().eq(1).text();
    	value = parseInt(value)/100;
    	showRepayModal(value, "alipay");
    });
    
    $(".modal-close").on("click", function(){
    	$(this).parents().find(".myModal").hide();
    });
    
    function showRepayModal(value, by){
    	$(".myModal-repay").find(".userProfile-modal-repay-amount").children().eq(0).text(value.toFixed(2)+"元");
    	$(".myModal-repay").find(".userProfile-modal-repay-amount").children().eq(1).text(value*100+"G");
    	$(".myModal-repay").find(".topupBySelect[data-by="+by+"]").show();
    	$(".myModal-repay").show();
    }
});
