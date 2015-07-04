(function() {
	$.fn.myBlink = function(speed) {
		return this.each(function() {
			setInterval(function() {
				$(this).fadeOut(speed).fadeIn(speed);
			}.bind(this), speed);
		});
	}

	$.fn.myMenu = function(options) {
		var settings = $.extend({
			width: 132,
			height: 30,
			optionSpacing: 1,
			backgroundColor: "#FFFFFF",
			parentBackgroundColor: "#FFFFFF",
			optionAmount: 3,
			className: "option",
			textValue: "my options",
			fontSize: 20,
			lineHight: 30,
			textMarginLeft: 10,
			menuDirection: 1
		}, options);
		var currentId = $(this).attr("id");
		var tempWrappedId = currentId + "SoupGe"
			//console.log(tempWrappedId);

		return this.each(function() {
			$(this).css({
				"width": settings.width + "px",
				"height": settings.height + "px",
				//"position": "relative",
				"background-color": settings.parentBackgroundColor,
				"cursor": "pointer"
			});
			$("<div>", {
				id: tempWrappedId,
				style: "position: relative; width: " + settings.width + "px;"
			}).html(settings.textValue).appendTo("#" + $(this).attr("id"));

			for (var i = 1; i <= settings.optionAmount; i++) {
				$("<div class='" + settings.className + "' />").css({
					"position": "absolute",
					"top": settings.menuDirection * (settings.height + settings.optionSpacing) * i + "px",
					"width": settings.width + "px",
					"height": settings.height + "px",
					"background-color": settings.backgroundColor,
					"display": "none",
					"cursor": "pointer",
					"font-size": settings.fontSize + "px",
					"line-height": settings.lineHeight + "px",
				}).html('<span style="margin-left: ' + settings.textMarginLeft + 'px;">Option ' + i + '</span>').appendTo("#" + tempWrappedId);
			}

			$(this).click(function() {
				var tempId = $(this).attr("id");
				//console.log(tempId);
				for (var i = 1; i <= settings.optionAmount; i++) {
					$("#" + tempId + " ." + settings.className + ":nth-child(" + i + ")").delay(50 * i).fadeToggle(100);
				}
				$("#" + tempId + " ." + settings.className).click(function(e) {
					e.stopPropagation();
				});
			});
		});
	}

	$.fn.twinSlide = function(options) {
		var settings = $.extend({
			trigger1: null,
			trigger2: null,
			content1: null,
			content2: null,
			contentWidth: null
		}, options);
		return this.each(function() {
			var trigger1 = "." + settings.trigger1;
			var trigger2 = "." + settings.trigger2;
			var content1 = "." + settings.content1;
			var content2 = "." + settings.content2;
			var contentWidth = parseInt(settings.contentWidth);
			$(trigger1).click(function() {
				$(content2).animate({
					left: contentWidth
				});
				$(content1).animate({
					left: 0
				}, 100);
			});
			$(trigger2).click(function() {
				$(content1).animate({
					left: contentWidth * (-1)
				});
				$(content2).animate({
					left: 0
				}, 100);
			});
		});
	}

	$.fn.toggleImgByHover = function(options) {
		var settings = $.extend({
			originImg: null,
			newImg: null
		}, options);

		return this.each(function() {
			var originImg = settings.originImg;
			var newImg = settings.newImg;
			$(this).hover(function() {
				$(this).attr("src", newImg);
			}, function() {
				$(this).attr("src", originImg);
			});
		});
	}
	
	$.fn.myLazyLoad = function(options){
		var settings = $.extend({
			selectorName: "img"
		}, options);
			var scroll = 0,
				selectorName = settings.selectorName;
			
			$(document).scroll(function(){
				scroll = $(this).scrollTop();
				$(selectorName).each(function(){
					if($(this).position().top-scroll<=$(window).height()*0.8){
							$(this).attr("src", $(this).data("origin"));
						}
					}
				);
			});
	}
	
	$.fn.myRoller = function(options){
		var settings = $.extend({
			id: 1,
			amount: 4,
			rollerWidth: 1180,
			rollerHeight: 480,
			rollerSpeed: 5000,
			imgUrl: "img/test/0",
			imgType: "jpg",
			pointerSize: 15,
			pointerSpacing: 5,
			pointerBottom: 20,
			pointerColor: "#cccccc",
			pointerSelectedColor: "#cfe6ff",
			salt: 1
		}, options);
		
		return this.each(function(){
			var id = settings.id,
				amount = settings.amount,
				rollerWidth = settings.rollerWidth,
				rollerHeight = settings.rollerHeight,
				rollerSpeed = settings.rollerSpeed,
				imgUrl = settings.imgUrl,
				imgType = settings.imgType,
				pointerSize = settings.pointerSize,
				pointerSpcing = settings.pointerSpacing,
				pointerBottom = settings.pointerBottom,
				pointerColor = settings.pointerColor,
				pointerSelectedColor = settings.pointerSelectedColor,
				salt = settings.salt;
			
			$(this).append('<div class="myRollerContainer"></div>');
		
			$(".myRollerContainer").css({
				"width": rollerWidth+"px",
				"height": rollerHeight+"px",
				"position": "relative"
			});
			
			for(var i=1;i<=amount;i++){
				$(".myRollerContainer").append('<div class="myRollerLoop myRollerLoop'+i+'"><img src="'+imgUrl+i+'.'+imgType+'" /></div>');	
			}
			
			$(".myRollerLoop").css({
				"width": rollerWidth+"px",
				"height": rollerHeight+"px",
				"position": "absolute",
				"top": "0",
				"left": "0",
				"display": "none"
			});
			
			$(".myRollerLoop img").css({
				"width": rollerWidth+"px",
				"height": rollerHeight+"px"
			});
			
			$(".myRollerLoop1").css("display", "block");
			
			$(".myRollerContainer").append('<div class="myRollerArrow myRollerLeft"><span class="myRollerText">&lt;</span></div>');
			$(".myRollerContainer").append('<div class="myRollerArrow myRollerRight"><span class="myRollerText">&gt;</span></div>');
			
			$(".myRollerArrow").css({
				"width": "30px",
				"height": rollerHeight+"px",
				"position": "absolute",
				"cursor": "pointer",
				"color": "#FFFFFF",
				"font-size": "30px",
				"text-align": "center",
				"font-weight": "bold",
				"line-height": rollerHeight+"px"
			});
			
			$(".myRollerLeft").css("left","0");
			$(".myRollerRight").css("right","0");
			
			$(".myRollerContainer").append("<div class='myRollerPointerContainer'></div>");
			
			for(var i=1;i<=amount;i++){
				$(".myRollerPointerContainer").append('<div class="myRollerPointer myRollerPointer'+i+'"></div>');	
			}
			
			$(".myRollerPointerContainer").css({
				"position": "absolute",
				"width": (pointerSize*amount + pointerSpcing*amount)+"px",
				"height": pointerSize,
				"margin-left": -(pointerSize*amount + pointerSpcing*(amount-1))/2+"px",
				"left": "50%",
				"bottom": pointerBottom+"px"
			});
			
			$(".myRollerPointer").css({
				"width": pointerSize,
				"height": pointerSize,
				"background-color": pointerColor,
				"cursor": "pointer",
				"margin-left": pointerSpcing+"px",
				"float": "left",
				"border-radius": "100%"
			});
			
			$(".myRollerPointer").on("click", function(){
				var temp = $(this).attr("class");
				temp = temp.substr(temp.length-1);
				id = temp-1;
				resetInterval();
				roller();
			});
			
			
			$(".myRollerLeft").on("click", function(){
				resetInterval();
				salt = -1;
				roller();
			});
			
			$(".myRollerRight").on("click", function(){
				resetInterval();
				roller();
			});
			
			var loopRoller = setInterval(function(){
				roller();
			}, rollerSpeed);
			
			function roller(){
				if(salt==-1){
					if(id==1){
						id=amount+1;
					}
				}else{
					if(id==amount){
						id=0;
					}
				}
				id = parseInt(id)+salt;
				roller2();
				salt = 1;
			}
			
			function roller2(){
				$(".myRollerLoop").fadeOut();
				$(".myRollerLoop"+id).fadeIn();
				setPointer(id);
			}
			
			function resetInterval(){
				clearInterval(loopRoller);
				loopRoller = setInterval(function(){
					roller();
				}, rollerSpeed);
			}
			
			function setPointer(){
				//console.log();
				$(".myRollerPointer").css("background-color", pointerColor);
				$(".myRollerPointer"+id).css("background-color", pointerSelectedColor);
			}
		});
	}

}(jQuery));

(function($) {
	$.extend({
		ms_DatePicker: function(options) {
				var defaults = {
					YearSelector: "#sel_year",
					MonthSelector: "#sel_month",
					DaySelector: "#sel_day",
					FirstText: "--",
					FirstValue: 0
				};
				var opts = $.extend({}, defaults, options);
				var $YearSelector = $(opts.YearSelector);
				var $MonthSelector = $(opts.MonthSelector);
				var $DaySelector = $(opts.DaySelector);
				var FirstText = opts.FirstText;
				var FirstValue = opts.FirstValue;

				// 初始化 
				var str = "<option value=\"" + FirstValue + "\">" + FirstText + "</option>";
				$YearSelector.html(str);
				$MonthSelector.html(str);
				$DaySelector.html(str);

				// 年份列表 
				var yearNow = new Date().getFullYear();
				var yearSel = $YearSelector.attr("rel");
				for (var i = yearNow; i >= 1900; i--) {
					var sed = yearSel == i ? "selected" : "";
					var yearStr = "<option value=\"" + i + "\" " + sed + ">" + i + "</option>";
					$YearSelector.append(yearStr);
				}

				// 月份列表 
				var monthSel = $MonthSelector.attr("rel");
				for (var i = 1; i <= 12; i++) {
					var sed = monthSel == i ? "selected" : "";
					var monthStr = "<option value=\"" + i + "\" " + sed + ">" + i + "</option>";
					$MonthSelector.append(monthStr);
				}

				// 日列表(仅当选择了年月) 
				function BuildDay() {
					if ($YearSelector.val() == 0 || $MonthSelector.val() == 0) {
						// 未选择年份或者月份 
						$DaySelector.html(str);
					} else {
						$DaySelector.html(str);
						var year = parseInt($YearSelector.val());
						var month = parseInt($MonthSelector.val());
						var dayCount = 0;
						switch (month) {
							case 1:
							case 3:
							case 5:
							case 7:
							case 8:
							case 10:
							case 12:
								dayCount = 31;
								break;
							case 4:
							case 6:
							case 9:
							case 11:
								dayCount = 30;
								break;
							case 2:
								dayCount = 28;
								if ((year % 4 == 0) && (year % 100 != 0) || (year % 400 == 0)) {
									dayCount = 29;
								}
								break;
							default:
								break;
						}

						var daySel = $DaySelector.attr("rel");
						for (var i = 1; i <= dayCount; i++) {
							var sed = daySel == i ? "selected" : "";
							var dayStr = "<option value=\"" + i + "\" " + sed + ">" + i + "</option>";
							$DaySelector.append(dayStr);
						}
					}
				}
				$MonthSelector.change(function() {
					BuildDay();
				});
				$YearSelector.change(function() {
					BuildDay();
				});
				if ($DaySelector.attr("rel") != "") {
					BuildDay();
				}
			} // End ms_DatePicker 
	});
})(jQuery);