$(function(){
	
	 var china = [
		 //直辖市
		 ['北京市'],
		 ['上海市'],
		 ['天津市'],
		 ['重庆市'],
		 //华北地区
		 ['河北省','石家庄','唐山','秦皇岛','邯郸','邢台','保定','张家口','承德','沧州','廊坊','衡水'],
		 ['山西省','太原','大同','阳泉','长治','晋城','朔州','晋中','运城','忻州','临汾','吕梁'],
		 ['内蒙古自治区','呼和浩特','包头','乌海','赤峰','通辽','鄂尔多斯','呼伦贝尔','巴彦淖尔','乌兰察布','兴安','锡林郭勒','阿拉善'],
		 //东北地区
		 ['辽宁省','沈阳','大连','鞍山','抚顺','本溪','丹东','锦州','营口','阜新','辽阳','盘锦','铁岭','朝阳','葫芦岛'],
		 ['吉林省','长春','吉林','四平','辽源','通化','白山','松原','白城','延边'],
		 ['黑龙江','哈尔滨','齐齐哈尔','鸡西','鹤岗','双鸭山','大庆','伊春','佳木斯','七台河','牡丹江','黑河','绥化','大兴安岭'],
		 //华东地区
		 ['江苏省','南京','无锡','徐州','常州','苏州','南通','连云港','淮安','盐城','扬州','镇江','泰州','宿迁'],
		 ['浙江省','杭州','宁波','温州','嘉兴','湖州','绍兴','金华','衢州','舟山','台州','丽水'],
		 ['安徽省','合肥','芜湖','蚌埠','淮南','马鞍山','淮北','铜陵','安庆','黄山','滁州','阜阳','宿州','巢湖','六安','亳州','池州','宣城'],
		 ['福建省','福州','厦门','莆田','三明','泉州','漳州','南平','龙岩','宁德'],
		 ['江西省','南昌','景德镇','萍乡','九江','新余','鹰潭','赣州','吉安','宜春','抚州','上饶'],
		 ['山东省','济南','青岛','淄博','枣庄','东营','烟台','潍坊','威海','济宁','泰安','日照','莱芜','临沂','德州','聊城','滨州','菏泽'],
		 //中南地区
		 ['河南省','郑州','开封','洛阳','平顶山','焦作','鹤壁','新乡','安阳','濮阳','许昌','漯河','三门峡','南阳','商丘','信阳','周口','驻马店'],
		 ['湖北省','武汉','黄石','襄樊','十堰','荆州','宜昌','荆门','鄂州','孝感','咸宁','随州','恩施'],
		 ['湖南省','长沙','株洲','湘潭','衡阳','邵阳','岳阳','常德','张家界','益阳','郴州','永州','怀化','娄底','湘西'],
		 ['广东省','广州','深圳','珠海','汕头','韶关','佛山','江门','湛江','茂名','肇庆','惠州','梅州','汕尾','河源','阳江','清远','东莞','中山','潮州','揭阳','云浮'],
		 ['广西自治区','南宁','柳州','桂林','梧州','北海','防城港','钦州','贵港','玉林','百色','贺州','河池','来宾','崇左'],
		 ['海南省','海口','三亚'],
		 //西南地区
		 ['四川省','成都','自贡','攀枝花','泸州','德阳','绵阳','广元','遂宁','内江','乐山','南充','宜宾','广安','达州','眉山','雅安','巴中','资阳',"阿坝","甘孜","凉山"],
		 ['贵州省','贵阳',"六盘水","遵义","安顺","铜仁","毕节","黔西南","黔东南","黔南"],
		 ['云南省','昆明','曲靖','玉溪',"保山","昭通","丽江","普洱","临沧","文山","红河","西双版纳","楚雄","大理","德宏","怒江","迪庆"],
		 ['西藏自治区',"拉萨","昌都","山南","日喀则","那曲","阿里","林芝"],
		 //西北地区
		 ['陕西省','西安','铜川','宝鸡','咸阳','渭南','延安','汉中','榆林','安康','商洛'],
		 ['甘肃省',"兰州","嘉峪关","金昌","白银","天水","武威","张掖","平凉","酒泉","庆阳","定西","陇南","临夏","甘南"],
		 ['青海省',"西宁","海东","海北","黄南","海南","果洛","玉树","海西"],
		 ['宁夏自治区','银川',"石嘴山","吴忠","固原","中卫"],
		 ['新疆自治区','乌鲁木齐',"克拉玛依","吐鲁番","哈密","和田","阿克苏","喀什","克孜勒苏柯尔克孜","巴音郭楞蒙古","昌吉","博尔塔拉蒙古","伊犁哈萨克","塔城","阿勒泰"],
		 //港澳台
		 ['香港特别行政区'],
		 ['澳门特别行政区'],
		 ['台湾省',"台北","高雄","基隆","台中","台南","新竹","嘉义"]
	];
	var postCount = 2;
	
	if(notLogin()){
		$(".profileContainer").hide();
		showLogin();
	}
	
	getUserInfo();
	var profilePointer = window.location.href;
	profilePointer = profilePointer.split("#");
	profilePointer = profilePointer[1];
	console.log(profilePointer);
	if(profilePointer=="myNaming"){
		profileSubPageSwitch(552, "profile_naming.html", 5);
	}else if(profilePointer=="myPost"){
		profileSubPageSwitch(424, "profile_post.html", 4);
	}else if(profilePointer=="mySingup"){
		$(".profileNav ul li").removeClass("profileNavHighlighter2");
		$(".profileNav ul li:nth-child(6)").addClass("profileNavHighlighter2");
		$(".profileNavHighlighter").css("left","680px");
		$(".profileMain").load("profile_singup.html", function(){
			profileUserLiveDate();
			profileUserLiveDateD(2015, 01);
		});
	}else{
		getUserInfo();
	}
	
	
	
	profileUserDob();
	//profileUserDobD(1900, 01);
	profileUserLiveDate();
	//profileUserLiveDateD(2015, 01);
	createProvince();
	createCity();
	
	setTimeout(function(){
		profileUserDobD(1900, 01);
	},0);
	
	$(".navSub span").first().removeClass("navHighlight");
	$(".navSub").removeClass("navSelected");
	
	$(document).on("change", ".profileUserDobY", function(){
		
		var y = $(this).val();
		var m = $(".profileUserDobM").val();
		$(".profileUserDobD").html("");
		profileUserDobD(y, m);
	});
	
	$(document).on("change", ".profileUserLiveDateY", function(){
		var y = $(this).val();
		var m = $(".profileUserLiveDateM").val();
		$(".profileUserLiveDateD").html("");
		profileUserLiveDateD(y, m);
	});
	
	$(document).on("change", ".profileUserDobM", function(){
		var m = $(this).val();
		var y = $(".profileUserDobY").val();
		$(".profileUserDobD").html("");
		profileUserDobD(y, m);
	});
	
	$(document).on("change", ".profileUserLiveDateM", function(){
		var m = $(this).val();
		var y = $(".profileUserLiveDateY").val();
		$(".profileUserLiveDateD").html("");
		profileUserLiveDateD(y, m);
	});
	
	$(document).on("change", ".profileUserLocationP", function(){
		var l = china.length;
		var v = $(".profileUserLocationP").val();
		$(".profileUserLocationC").html("");
		for(var i=0;i<l;i++){
			if(china[i][0]==v){
				for(var j=0;j<china[i].length;j++){
					$(".profileUserLocationC").append("<option>"+china[i][j]+"</option>");
				}
			}
		}			
	});
	
	$(document).on("click", ".profileUserSingUpCheck", function(){
		$(this).toggleClass("profileUserSingUpChecked");
	});

	$(document).on("click", ".profileUserNamingCheck", function(){
		$(this).toggleClass("profileUserNamingChecked");
	});
	
	$(document).on("click", ".profileNav ul li", function(){
		var value = $(this).text();
		$(".profileNav ul li").removeClass("profileNavHighlighter2");
		$(this).addClass("profileNavHighlighter2");
		if(value == "基本信息"){
			$(".profileNavHighlighter").css("left","40px");
			$(".profileMain").load("profile_basic.html", function(){
				profileUserDob();
				profileUserDobD(1900, 01);
				createProvince();
				createCity();
				getUserInfo();
			});
		}else if(value == "修改密码"){
			$(".profileNavHighlighter").css("left","296px");
			$(".profileMain").load("profile_pwd.html");
		}else if(value == "修改头像"){
			$(".profileNavHighlighter").css("left","168px");
			$(".profileMain").load("profile_userIcon.html");
		}else if(value == "我要出题"){
			$(".profileNavHighlighter").css("left","424px");
			$(".profileMain").load("profile_post.html");
		}else if(value == "我要冠名"){
			$(".profileNavHighlighter").css("left","552px");
			$(".profileMain").load("profile_naming.html");
		}else if(value == "我要报名"){
			$(".profileNavHighlighter").css("left","680px");
			$(".profileMain").load("profile_singup.html", function(){
				profileUserLiveDate();
				profileUserLiveDateD(2015, 01);
			});
		}
	});
	
	$(document).on("click", ".profileUserPostChooseNew", function(){
		console.log(postCount);
		if(postCount<4){
			postCount++;
			$(".profileUserPostChooseIncorrect").eq(1).append('<div class="profileUserPostChooseIncorrect"><input type="text" placeholder="请在此填写干扰答案" /><div class="profileUserPostChooseIncorrectIcon"></div><div class="profileUserPostChooseDelete"></div></div>');
		}
		if(postCount==4){
			$(".profileUserPostChooseNewText").css({
				"color": "#ccc",
				"cursor": "default"
			});
			$(this).on("mouseenter", function(){
				$(this).css("opacity", "1");
			}).on("mouseleave", function(){
				$(this).css("opacity", "1");
			});
		}
	});
	
	$(document).on("click", ".profileUserPostChooseDelete", function(){
		$(this).parent().remove();
		postCount--;
		$(".profileUserPostChooseNewText").css({
			"color": "#000",
			"cursor": "pointer"
		});
	});
	
	$(document).on("keydown", ".profileUserPostWriteArea", function(){
		var value = $(this).val();
		var count = value.length+1;
		if(count<=150){
			$(".profileUserPostWriteAreaCounter").css("color","black");
			$(".profileUserPostWriteAreaCounter span").text(count);
		}else{
			var a = $(this).val();
            a = a.substring(0, 150);
            $(this).val(a);
			$(".profileUserPostWriteAreaCounter").css("color","red");
		}
	});

	function profileUserDobD(y, m){
		var d;
		$(".profileUserDobD").html("");
		if(m==1||m==3||m==5||m==7||m==8||m==10||m==12){
			d = 31;
		}else if(m==4||m==6||m==9||m==11){
			d = 30;
		}else if(m==2){
			if(y%4==0){
				d = 28;
			}else{
				d = 29;
			}
		}
		for(var i=1;i<=d;i++){
			if(i<=9){
				$(".profileUserDobD").append("<option>0"+i+"</option>");	
			}else{
				$(".profileUserDobD").append("<option>"+i+"</option>");
			}
			
		}
	}
	
	function profileUserLiveDateD(y, m){
		var d;
		$(".profileUserDobD").html("");
		if(m==1||m==3||m==5||m==7||m==8||m==10||m==12){
			d = 31;
		}else if(m==4||m==6||m==9||m==11){
			d = 30;
		}else if(m==2){
			if(y%4==0){
				d = 28;
			}else{
				d = 29;
			}
		}
		for(var i=1;i<=d;i++){
			if(i<=9){
				$(".profileUserLiveDateD").append("<option>0"+i+"</option>");	
			}else{
				$(".profileUserLiveDateD").append("<option>"+i+"</option>");
			}
			
		}
	}
	
	function profileUserDob(){
 		for(var i=1900;i<=2010;i++){
 			$(".profileUserDobY").append("<option>"+i+"</option>");
 		}
 		for(var i=1;i<=12;i++){
 			if(i<=9){
 				$(".profileUserDobM").append("<option>0"+i+"</option>");
 			}else{
 				$(".profileUserDobM").append("<option>"+i+"</option>");	
 			}
 		}
 	}
	
	function profileUserLiveDate(){
		for(var i=2015;i<=2016;i++){
 			$(".profileUserLiveDateY").append("<option>"+i+"</option>");
 		}
 		for(var i=1;i<=12;i++){
 			if(i<=9){
 				$(".profileUserLiveDateM").append("<option>0"+i+"</option>");
 			}else{
 				$(".profileUserLiveDateM").append("<option>"+i+"</option>");	
 			}
 		}
	}
	
	function createProvince(){
		for(var i=0;i<china.length;i++){
			$(".profileUserLocationP").append("<option>"+china[i][0]+"</option>");
		}
	}
	
	function createCity(){
		$(".profileUserLocationC").append("<option>北京市</option>");
	}
	
	function getUserInfo(){
		$.ajax({
			type:"get",
			url: "/app/user/myInfo",
			xhrFields: { withCredentials: true },
			sync: false,
			success: function(data){
				console.log(data);
				var value = JSON.parse(data),
					user = value.data.user,
					name = user.username,
					avatar = user.avatarUri,
					lvl = user.level,
					dobY = user.birthdayYear,
					dobM = user.birthdayMonth,
					dobD = user.birthdayDay,
					bal = user.money,
					id = user.checkSum;
				$(".profileUserName").text(name);
				$(".profileTd1_2").first().text(name);
				$(".profileUserImg").css("background", "url("+avatar+")");
				$(".profileUserId span").first().text(id);
				$(".profileUserBalAmount span").text(bal);
				$(".profileUserLvlNum").text(lvl);
				$(".profileUserDobY").val(dobY);
				$(".profileUserDobM").val(dobM);
				$(".profileUserDobD").val(dobD);
			}
		});
	}
	
	function profileSubPageSwitch(a,b,c){
		$(".profileNavHighlighter").css("left",a+"px");
		$(".profileMain").load(b);
		$(".profileNav ul li").removeClass("profileNavHighlighter2");
		$(".profileNav ul li:nth-child("+c+")").addClass("profileNavHighlighter2");
	}
});
