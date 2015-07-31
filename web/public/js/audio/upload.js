var Qiniu_UploadUrl = "http://up.qiniu.com";
var queryString = "http://121.40.174.3:2004/api/common/upload/token";
var uploadToken;
var answeringId;


this.onmessage = function(e){
	if (e.data.command == 'init') {
		answeringId = e.data.answeringId
		getToken();
	} else if (e.data.command == 'upload') {
		var file = new File([e.data.blob], 'sound.ogg', {type: "audio/ogg"});
		Qiuniu_upload(file, uploadToken);
	}
}

function getToken(){
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open('GET', queryString);
	xmlHttp.onreadystatechange = function(response) {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200 && xmlHttp.responseText != "") {
			var blkRet = JSON.parse(xmlHttp.responseText);
			uploadToken = blkRet.uptoken;
		} else if (xmlHttp.status != 200 && xmlHttp.responseText) {
		} else {}		
	}
	xmlHttp.send(null);
}

//TODO add key to protect
function Qiuniu_upload(f, token) {
	var xhr = new XMLHttpRequest();
	var key = Date.now();
	xhr.open('POST', Qiniu_UploadUrl, true);

	var formData, startDate;
	formData = new FormData();
	//if (key !== null && key !== undefined) formData.append('key', key);
	//设置上传后的文件名
	formData.append('key', key);
	formData.append('token', token);
	formData.append('file', f);

	xhr.upload.addEventListener("progress", function(event) {
		//TODO
	}, false);

	xhr.onreadystatechange = function(response) {
		if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText != "") {
			var blkRet = JSON.parse(xhr.responseText);
			addAudioSlice(key);
		} else if (xhr.status != 200 && xhr.responseText) {
			// TODO some error
		} else {
			// TODO some error
		}
	}

	xhr.send(formData);
}

function addAudioSlice(key){
	var xhr = new XMLHttpRequest();
	xhr.open('POST', "http://121.40.174.3/api/answering/addAudioSlice", true);

	xhr.onreadystatechange = function(response) {
		if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText != "") {
			//var blkRet = JSON.parse(xhr.responseText);
			console.log("Add audio slice result:" + xhr.responseText);
		} else if (xhr.status != 200 && xhr.responseText) {
			// TODO some error
		} else {
			// TODO some error
		}
	}
	console.log(answeringId);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send('key=' + key + '&answeringId=' + answeringId);		
}