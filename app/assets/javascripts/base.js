var KEYS = {
    37: 'lt'
  , 39: 'rt'
  , 38: 'up'
  , 40: 'dn'
  , 27: 'esc'
  , 32: 'space'
  , 13: 'enter'
  , 74: 'j'
  , 75: 'k'
};

var player = {};

player.init = function(){
  this.elem = $('video');
  this.dom = this.elem.get(0);

  if (this.elem.length) {
    this.initKeyboard();
  }
};

player.initKeyboard = function(){
  var self = this;

  $(document).on('keydown', function(e){
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return true;

    var key = KEYS[e.which];
    var caught = true;

    switch (key) {
      case 'space': self.pause();   break;
      case 'esc':   self.stop();    break;
      case 'rt':    self.advance(); break;
      case 'lt':    self.reverse(); break;
      case 'up':    self.louder();  break;
      case 'dn':    self.quieter(); break;

      default:
        caught = false;
        break;
    }

    if (caught) e.stopImmediatePropagation();
  });
};

player.showControls = function(){
  this.elem.attr('controls', 'controls');
};

player.hideControls = function(){
  this.elem.removeAttr('controls');
};

player.play = function(id){
  this.dom.play();
  this.hideControls();
};

player.pause = function(){
  if (this.dom.paused) {
    this.play();
  } else {
    this.dom.pause();
    this.showControls();
  }
};

player.stop = function(){
  history.back();
};

player.advance = function(){
  this.dom.currentTime += 10;
};

player.reverse = function(){
  this.dom.currentTime -= 10;
};

player.louder = function(){
  this.dom.volume = Math.min(this.dom.volume + 0.1, 1.0);
};

player.quieter = function(){
  this.dom.volume = Math.max(this.dom.volume - 0.1, 0.0);
};

$(function(){
  player.init();
});

