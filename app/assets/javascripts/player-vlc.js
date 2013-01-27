// Player VLC - VLC plugin element

var playerVlc = {};

playerVlc.lastTimeChange = 0;

playerVlc.init = function(){
  this.elem = $('object[type="application/x-vlc-plugin"]');

  if (this.elem.length) {
    this.dom = this.elem.get(0);
    this.dom.audio.volume = 50;

    this.initEvents();
    this.initKeyboard();
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

playerVlc.initKeyboard = function(){
  var self = this;

  keys.addHandler(function(key){
    switch (key) {
      case 'space': self.pause();   break;
      case 'rt':    self.advance(); break;
      case 'lt':    self.reverse(); break;
      case 'up':    self.louder();  break;
      case 'dn':    self.quieter(); break;
      default:      return false;   break;
    }

    return true;
  });
};

playerVlc.checkProgress = function(){
  var currTimeChange = this.time();
  if (currTimeChange > this.lastTimeChange + (15 * 1000)) {
    this.updateProgress();
    this.lastTimeChange = currTimeChange;
  }
};

playerVlc.updateProgress = function(){
  $.ajax({
    url: location.pathname + '/progress',
    type: 'POST',
    data: { time: this.time(), _method: 'PUT' }
  });
};

playerVlc.time = function(){
  return this.dom.input.time;
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
  this.dom.volume = Math.min(this.dom.volume + 10, 200);
};

playerVlc.quieter = function(){
  this.dom.volume = Math.max(this.dom.volume - 10, 0);
};
