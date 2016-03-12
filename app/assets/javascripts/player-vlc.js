// Player VLC - VLC plugin element

var playerVlc = {};

playerVlc.type = 'vlc';
playerVlc.lastTimeChange = 0;
playerVlc.seekProgress;
playerVlc.originalSubtitleTrack;

playerVlc.init = function(){
  this.elem = $('object[type="application/x-vlc-plugin"]');

  if (this.elem.length) {
    this.dom = this.elem.get(0);
    this.initEvents();
    this.resume();
    return this;
  }
};

playerVlc.initEvents = function(){
  var self = this;

  this.dom.addEventListener('MediaPlayerOpening', function(){
    self.dom.audio.volume = 50;
    self.seekOrPoll();
  }, false);

  this.dom.addEventListener('MediaPlayerPausableChanged', function(){
  }, false);

  this.dom.addEventListener('MediaPlayerTimeChanged', function(){
    self.checkProgress();
  }, false);

  this.dom.addEventListener('MediaPlayerEndReached', function(){
    self.stop();
  }, false);

  $(window).unload(function(){
    self.updateProgress();
  });
};

playerVlc.seekOrPoll = function(){
  if (this.seekProgress) {
    if (this.getDuration()) {

      this.setProgress(this.seekProgress);
      this.seekProgress = null;

    } else {

      var self = this;
      setTimeout(function(){
        self.seekOrPoll();
      }, 100);

    }
  }
};

playerVlc.checkProgress = function(){
  var currTimeChange = this.getTime();
  if (currTimeChange > this.lastTimeChange + (15 * 1000)) {
    this.updateProgress();
    this.lastTimeChange = currTimeChange;
  }
};

playerVlc.updateProgress = function(){
  $.ajax({
    url: location.pathname + '/progress',
    type: 'POST',
    data: { progress: this.getProgress(), _method: 'PUT' }
  });
};

playerVlc.resume = function(){
  var src = this.elem.data('src');

  var progress = this.elem.data('progress');
  if (progress) this.seekProgress = progress;

  // The VLC plugin doesn't seem to be able to parse metadata (e.g. duration)
  // for an http:// URL, but will for file://. However, Chrome wont let us use
  // a file:// URL directly because of the same-origin policy.

  // We can route around the problem by using the VLC plugin's API to load the
  // file instead though. Since that seems to fly under Chrome's radar.

  // With the metadata loaded we're then able to seek, advance and reverse to
  // our heart's content:

  this.dom.playlist.add(src);
  this.dom.playlist.play();
};

playerVlc.stop = function(){
  page.back();
};

playerVlc.pause = function(){
  this.dom.playlist.togglePause();
};

playerVlc.advance = function(){
  this.dom.input.time += 10 * 1000;
};

playerVlc.reverse = function(){
  this.dom.input.time -= 10 * 1000;
};

playerVlc.louder = function(){
  this.dom.audio.volume = Math.min(this.dom.audio.volume + 10, 200);
};

playerVlc.quieter = function(){
  this.dom.audio.volume = Math.max(this.dom.audio.volume - 10, 0);
};

playerVlc.setTime = function(time){
  this.dom.input.time = time;
  this.lastTimeChange = time;
};

playerVlc.getTime = function(){
  return this.dom.input.time;
};

playerVlc.getDuration = function(){
  return this.dom.input.length;
};

playerVlc.setProgress = function(progress){
  this.setTime(this.getDuration() * progress);
};

playerVlc.getProgress = function(){
  return this.getTime() / this.getDuration();
};

playerVlc.getVolume = function(){
  return this.dom.audio.volume / 200;
};

playerVlc.subtitle = function(){
  if (this.dom.subtitle.track) {
    this.originalSubtitleTrack = this.dom.subtitle.track;
    this.dom.subtitle.track = 0;
  } else {
    this.dom.subtitle.track = this.originalSubtitleTrack;
  }
}
