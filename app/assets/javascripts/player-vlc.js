// Player VLC - VLC plugin element

var playerVlc = {};

playerVlc.lastTimeChange = 0;

playerVlc.init = function(){
  this.elem = $('object[type="application/x-vlc-plugin"]');

  if (this.elem.length) {
    this.dom = this.elem.get(0);
    this.dom.audio.volume = 50;
    this.initEvents();
    return this;
  }
};

playerVlc.initEvents = function(){
  var self = this;

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
    data: { time: this.getTime(), _method: 'PUT' }
  });
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

playerVlc.getTime = function(){
  return this.dom.input.time;
};

playerVlc.getDuration = function(){
  return this.elem.data('duration');
};

playerVlc.getVolume = function(){
  return this.dom.audio.volume / 200;
};
