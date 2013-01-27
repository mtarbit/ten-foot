// Player HTML5 - HTML5 video element

var playerHtml5 = {};

playerHtml5.lastTimeChange = 0;

playerHtml5.init = function(){
  this.elem = $('video');

  if (this.elem.length) {
    this.dom = this.elem.get(0);

    this.initEvents();
    this.initKeyboard();
  }
};

playerHtml5.initEvents = function(){
  var self = this;

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

playerHtml5.initKeyboard = function(){
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

playerHtml5.checkProgress = function(){
  var currTimeChange = this.time();
  if (currTimeChange > this.lastTimeChange + (15 * 1000)) {
    this.updateProgress();
    this.lastTimeChange = currTimeChange;
  }
};

playerHtml5.updateProgress = function(){
  $.ajax({
    url: location.pathname + '/progress',
    type: 'POST',
    data: { time: this.time(), _method: 'PUT' }
  });
};

playerHtml5.time = function(){
  return Math.round(this.dom.currentTime * 1000);
};

playerHtml5.showControls = function(){
  this.elem.attr('controls', 'controls');
};

playerHtml5.hideControls = function(){
  this.elem.removeAttr('controls');
};

playerHtml5.stop = function(){
  page.back();
};

playerHtml5.play = function(){
  this.dom.play();
  this.hideControls();
};

playerHtml5.pause = function(){
  if (this.dom.paused) {
    this.play();
  } else {
    this.dom.pause();
    this.showControls();
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
