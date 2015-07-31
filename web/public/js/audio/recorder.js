"undefined" === typeof recorder && (recorder={});
(function(g){
	var RECORD_WORKER_PATH = 'http://121.40.174.3/js/audio/worker.js';
	var UPLOAD_WORKER_PATH = 'http://121.40.174.3/js/audio/upload.js';

	g.init = function(source, cfg){
		g.context = source.context;

		if(!g.context.createScriptProcessor){
			g.node = g.context.createJavaScriptNode(16384, 2, 2);
		} else {
			g.node = g.context.createScriptProcessor(16384, 2, 2);
		}

		//音频录制进程
		g.worker = new Worker(RECORD_WORKER_PATH);
		g.worker.postMessage({
			command: 'init',
			config: {
				sampleRate: g.context.sampleRate
			}
		});

		//音频上传进程
		g.uploadWorker = new Worker(UPLOAD_WORKER_PATH);
		g.uploadWorker.postMessage({
			command: 'init',
			//check answeringId here
			answeringId: info.answeringId
		})

		//音频压缩进程
		g.ffmpegWorker = createFFmpegWorker();
		g.ffmpegWorkerReady = false;
		g.ffmpegWorker.onmessage = function(event){
			//console.log(JSON.stringify(event));
			var message = event.data;
			if (message.type == 'ready') {
				console.log('ffmpeg ready');
				g.ffmpegWorkerReady = true;
			} else if (message.type == 'done') {
				//ffmpeg 处理成功！
				var result = message.data[0];
				console.log(JSON.stringify(result));

				var blob = new Blob([result.data], {
					type: 'audio/ogg'
				});
				
				console.log('ffmpeg done!');
				
				g.uploadWorker.postMessage({
					command: 'upload',
					blob: blob
				})

				//g.setupDownload(blob, 'test');
				//this.postMessage(blob);
			}			
		}

		//音频收到消息
		g.worker.onmessage = function(e){
			console.log('get wav! ' + e.data);
			var blob = e.data;
			var fileReader = new FileReader();
			var abb;
			fileReader.onload = function() {
				abb = this.result;
				console.log('fileReader on load! this.result = ' + abb);				
				g.ffmpegWorker.postMessage({
					type: 'command',
					arguments: [
                                '-i', 'audio.wav', 
                                '-c:a', 'vorbis', 
                                '-b:a', '16000', 
                                '-strict', 'experimental', 'output.mp4'
					],
					files: [
					    {
					        data: new Uint8Array(abb),
					        name: "audio.wav"
					    }
					]
				});
			}
			fileReader.readAsArrayBuffer(blob);
		}

		g.node.onaudioprocess = function(e){
			if(!g.recording) return;
			g.worker.postMessage({
				command: 'record',
				buffer: [
					e.inputBuffer.getChannelData(0),
					e.inputBuffer.getChannelData(1)
				]
			})
		}

		g.record = function(){
			g.recording = true;
		}

		g.stop = function(){
			g.recording = false;
		}

		g.setupDownload = function(blob, fileName){
			var hyperlink = document.createElement('a');
			hyperlink.href = URL.createObjectURL(blob);
			hyperlink.target = '_blank';
			hyperlink.download = (fileName || (Math.round(Math.random() * 9999999999) + 888888888)) + '.' + blob.type.split('/')[1];

			var evt = new MouseEvent('click', {
				view: window,
				bubbles: true,
				cancelable: true
			});

			hyperlink.dispatchEvent(evt);

			(window.URL || window.webkitURL).revokeObjectURL(hyperlink.href);			
		}

		source.connect(g.node);
		g.node.connect(g.context.destination);
	}

	g.record = function(){
		g.recording = true;
	}

	g.stop = function(){
		g.recording = false;
	}

	var createFFmpegWorker = function(){
		//FIXME
		var workerPath = 'http://121.40.174.3/js/audio/ffmpeg_asm.js';
		var blob = URL.createObjectURL(new Blob(['importScripts("' + workerPath + '");var now = Date.now;function print(text) {postMessage({"type" : "stdout","data" : text});};onmessage = function(event) {var message = event.data;if (message.type === "command") {var Module = {print: print,printErr: print,files: message.files || [],arguments: message.arguments || [],TOTAL_MEMORY: message.TOTAL_MEMORY || false};postMessage({"type" : "start","data" : Module.arguments.join(" ")});postMessage({"type" : "stdout","data" : "Received command: " +Module.arguments.join(" ") +((Module.TOTAL_MEMORY) ? ".  Processing with " + Module.TOTAL_MEMORY + " bits." : "")});var time = now();var result = ffmpeg_run(Module);var totalTime = now() - time;postMessage({"type" : "stdout","data" : "Finished processing (took " + totalTime + "ms)"});postMessage({"type" : "done","data" : result,"time" : totalTime});}};postMessage({"type" : "ready"});'], {
			type: 'application/javascript'
		}));
		var worker = new Worker(blob);
		URL.revokeObjectURL(blob);
		return worker;	
	}
})(recorder);