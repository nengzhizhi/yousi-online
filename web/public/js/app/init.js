var canvasArray = []
var ydraw = null
var operations = [];
var para = null;
function init( username, role, roomId, answeringId){
	para = new DrawParams();
	para.identify = role;
	para.username = username;
	para.roomId = roomId;
	para.answeringId = answeringId;
}