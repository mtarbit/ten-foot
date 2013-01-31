// Player HTML5 - HTML5 video element

var playerHtml5 = {};

playerHtml5.type = 'html5';
playerHtml5.lastTimeChange = 0;
playerHtml5.seekTime;

playerHtml5.init = function(){
  this.elem = $('video');

  if (this.elem.length) {
    this.dom = this.elem.get(0);
    this.initEvents();
    this.resume();
    return this;
  }
};

playerHtml5.initEvents = function(){
  var self = this;

  this.elem.on('loadedmetadata', function(){
    if (self.seekTime) self.setTime(self.seekTime);
  });

  this.elem.on('timeupdate', function(){
    self.checkProgress();
  });

  this.elem.on('ended', function(){
    self.stop();
  });

  $(window).unload(function(){
    self.updateProgress();
  });
};

playerHtml5.checkProgress = function(){
  var currTimeChange = this.getTime();
  if (currTimeChange > this.lastTimeChange + (15 * 1000)) {
    this.updateProgress();
    this.lastTimeChange = currTimeChange;
  }
};

playerHtml5.updateProgress = function(){
  $.ajax({
    url: location.pathname + '/progress',
    type: 'POST',
    data: { time: this.getTime(), _method: 'PUT' }
  });
};

playerHtml5.resume = function(){
  var time = this.elem.data('time');
  if (time) {
    this.lastTimeChange = time;
    this.seekTime = time;
  }

  this.dom.play();
};

playerHtml5.stop = function(){
  page.back();
};

playerHtml5.pause = function(){
  if (this.dom.paused) {
    this.dom.play();
  } else {
    this.dom.pause();
  }
};

playerHtml5.advance = function(){
  this.dom.currentTime += 10;
};

playerHtml5.reverse = function(){
  this.dom.currentTime -= 10;
};

playerHtml5.louder = function(){
  this.dom.volume = Math.min(this.dom.volume + 0.1, 1.0);
};

playerHtml5.quieter = function(){
  this.dom.volume = Math.max(this.dom.volume - 0.1, 0.0);
};

playerHtml5.setTime = function(time){
  this.dom.currentTime = time / 1000;
};

playerHtml5.getTime = function(){
  return Math.round(this.dom.currentTime * 1000);
};

playerHtml5.getDuration = function(){
  return Math.round(this.dom.duration * 1000);
};

playerHtml5.getVolume = function(){
  return this.dom.volume;
};
