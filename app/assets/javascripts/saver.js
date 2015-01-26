// Saver - screen saving after a period of inactivity

var saver = {};

saver.TIMER_DELAY = 2 * 60 * 1000;

saver.init = function(){
  if (page.is('feeds-show') || page.is('files-show') || page.is('search-show')) return;

  var self = this;

  this.canvas = $('<canvas>');
  this.canvas.css({ width: '100%', height: '100%', position: 'fixed', top: 0, left: 0, display: 'none' });

  $('body').append(this.canvas);

  this.dom = this.canvas.get(0);
  this.api = this.dom.getContext('2d');

  this.startTimer();

  $(document).keydown(function(e){ if (self.clear()) { e.stopImmediatePropagation(); } });
  $(document).mousemove(function(){ self.clear(); });
  $(window).resize(function(){ self.resize(); }).resize();
};

saver.startTimer = function(){
  var self = this;
  this.timeoutId = setTimeout(function(){ self.start(); }, self.TIMER_DELAY);
};

saver.clearTimer = function(){
  if (this.timeoutId) clearTimeout(this.timeoutId);
};

saver.resetTimer = function(){
  this.clearTimer();
  this.startTimer();
};

saver.start = function(){
  this.show();
  this.draw();
  this.clearTimer();
};

saver.clear = function(){
  if (this.canvas.is(':visible')) {
    this.hide();
    this.startTimer();
    return true;
  } else {
    this.resetTimer();
    return false;
  }
};

saver.resize = function(){
  this.w = this.canvas.width();
  this.h = this.canvas.height();
  this.canvas.attr({ width: this.w, height: this.h });
};

saver.draw = function(){
  this.api.clearRect(0, 0, this.w, this.h);
  this.api.fillStyle = 'rgb(0, 0, 0)';
  this.api.fillRect(0, 0, this.w, this.h);
};

saver.show = function(){
  this.canvas.fadeIn();
};

saver.hide = function(){
  this.canvas.fadeOut();
};
