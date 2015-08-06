"undefined"===typeof audio&&(audio={});
(function(a){

	a.soundObject = null
	a.url = ""
  a.callback = null

	a.dom = {
		progress : $(".sm2-progress-ball"),
		progressBar : $(".sm2-progress-bar"),
		progressTrack : $(".sm2-progress-track"),
		volume : $("a.sm2-volume-control"),
    time : $(".sm2-inline-time"),
    duration : $(".sm2-inline-duration"),
    main : $(".sm2-bar-ui"),
    btn : $(".sm2-inline-button")
	}

  a.actions = {
    play:function(){
      if (!a.soundObject) {
        a.soundObject = a.playWithURL(a.url);
      }
      soundObject.togglePause();
    },
    pause: function() {
        if (a.soundObject && a.soundObject.readyState) {
          a.soundObject.togglePause();
        }
    },
  }

  a.setCallBack = function(cb){
    a.callback = cb
  }

	a.playWithURL = function(url){
		a.url = url
    soundManager.setup({
    // trade-off: higher UI responsiveness (play/progress bar), but may use more CPU.
      html5PollingInterval: 16.7,
      flashVersion: 9
    });

    soundManager.onready(function() {
      a.dom.progressTrack.mousedown(function(e){
          var target, barX, barWidth, x, newPosition, sound;
          target = a.dom.progressTrack;
          barX = target.offset().left
          barWidth = target[0].offsetWidth;
          x = (e.clientX - barX);
          newPosition = (x / barWidth);
          sound = a.soundObject;
          if (sound && sound.duration) {
            sound.setPosition(sound.duration * newPosition);
            // a little hackish: ensure UI updates immediately with current position, even if audio is buffering and hasn't moved there yet.
            if (sound._iO && sound._iO.whileplaying) {
              sound._iO.whileplaying.apply(sound);
            }
          }
          if (e.preventDefault) {
            e.preventDefault();
          }
          return false;
      });

      a.dom.btn.on("click",function(e){
        console.log(a.soundObject.playState)
        if (a.soundObject.playState) {
          a.actions.pause()
        }else{
          a.actions.play()
        }
        
      })
        
      a.makeSound()
      a.soundObject.play()
  
    });
	}

  a.dom.progressTrack.on("onmousedown",function(e){
    console.log(e.target)
  })

	a.makeSound = function(){
		var sound = soundManager.createSound({
        url: a.url,
        volume: 100,
        whileplaying: function() {
        	//播放中
          // console.log("durationEstimate:",this.durationEstimate)
          // console.log("position:",this.position)
          // console.log("now:",Date.now())
          var progressMaxLeft = 100,
              left,
              width;
          left = Math.min(progressMaxLeft, Math.max(0, (progressMaxLeft * (this.position / this.durationEstimate)))) + '%';
          width = Math.min(100, Math.max(0, (100 * this.position / this.durationEstimate))) + '%';
          if (this.duration) { 
            a.dom.progress.css("left",left);
            a.dom.progressBar.css("width",width);
            a.dom.time.html(a.getTime(this.position, true))
            if (a.callback) {
              a.callback(this.position)
            }
            
          }

        },

        onbufferchange: function(isBuffering) {

     

        },

        onplay: function() {
        	//播放
          console.log("aaaaaaaa:",a.dom.main)
          
          a.dom.main.removeClass("paused").removeClass("playing").addClass("playing")
         
        },

        onpause: function() {
          a.dom.main.removeClass("playing").removeClass("paused").addClass("paused")
        },

        onresume: function() {
          a.dom.main.removeClass("paused").removeClass("playing").addClass("playing")
        },

        whileloading: function() {
          if (!this.isHTML5) {
            a.dom.duration.html(a.getTime(this.durationEstimate, true))
          }
        },

        onload: function(ok) {
          if (ok) {
             a.dom.duration.html(a.getTime(this.durationEstimate, true))
          } else if (this._iO && this._iO.onerror) {
            this._iO.onerror();
          }
        },

        onerror: function() {

     
        },
        onstop: function() {

          

        },

        onfinish: function() {

        }

      });
      a.soundObject = sound
	}

  a.getTime = function(msec, useString) {
    var nSec = Math.floor(msec/1000),
        hh = Math.floor(nSec/3600),
        min = Math.floor(nSec/60) - Math.floor(hh * 60),
        sec = Math.floor(nSec -(hh*3600) -(min*60));
    return (useString ? ((hh ? hh + ':' : '') + (hh && min < 10 ? '0' + min : min) + ':' + ( sec < 10 ? '0' + sec : sec ) ) : { 'min': min, 'sec': sec });
  }

})(audio)