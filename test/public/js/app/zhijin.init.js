$(function () {
	var defaultRoomId = "555caadf6ee1e5b41f2ec748";

	/**
	 * 获取房间信息
	 */
	$.ajax({
		type : "get",
		url : "http://localhost:3001/api/room/get",
		data : { id : defaultRoomId },
		async : true,
		success : function(result){
			$('#roomName').html(result.name);
			console.log('result' + result);
		}
	})

	/**
	 *	初始化聊天室
	 */

	 var socket = io("http://localhost:3003/chat/" + defaultRoomId);
	 socket.on('new connection', function (data){
	 	$('#status').html("连接成功！" + data.token);
	 });
	 socket.on('message', function (data){
	 	$('#box').append('<div><code>' + data.msg + '</code></div>');
	 });

	 $('#send').click(function(){
	 	socket.emit('message',{ msg : $('#message').val() })
	 });
})