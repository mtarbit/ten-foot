var controls = {};

controls.init = function(player){
  if (!player) return;
  this.player = player;

  this.elem = $('<div class="controls">');

  this.initStatusElems();
  this.initProgressElems();
  this.initVolumeElems();
  this.initKeyboard();

  $('body').append(this.elem);

  this.elem.hide();
};

controls.initStatusElems = function(){
  this.statusIcon = $('<i class="icon icon-play"></i>');
  this.statusWrap = $('<div class="controls-status">');
  this.statusWrap.append(this.statusIcon);

  this.elem.append(this.statusWrap);
};

controls.initProgressElems = function(){
  this.progressBar = $('<div class="controls-progress-bar">');
  this.progressBarInner = $('<div class="controls-progress-bar-inner">');
  this.progressBar.append(this.progressBarInner);

  this.progressNum = $('<div class="controls-progress-num">');
  this.progressTime = $('<span class="controls-progress-time">0:00:00</span>');
  this.progressDivider = $('<span class="controls-progress-divider">/</span>');
  this.progressDuration = $('<span class="controls-progress-duration">0:00:00</span>');
  this.progressNum.append(this.progressTime);
  this.progressNum.append(this.progressDivider);
  this.progressNum.append(this.progressDuration);

  this.elem.append(this.progressBar);
  this.elem.append(this.progressNum);
};

controls.initVolumeElems = function(){
  this.volumeIcon = $('<i class="icon icon-volume-up"></i>');
  this.volumeWrap = $('<div class="controls-volume">');
  this.volumeWrap.append(this.volumeIcon);

  this.volumeBar = $('<div class="controls-volume-bar">');
  this.volumeBarInner = $('<div class="controls-volume-bar-inner">');
  this.volumeBar.append(this.volumeBarInner);

  this.elem.append(this.volumeBar);
  this.elem.append(this.volumeWrap);
};

controls.initKeyboard = function(){
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

controls.formattedSeconds = function(s){
  var s = Math.round(s);
  var m = Math.floor(s / 60);
  var h = Math.floor(m / 60);

  var H = h % 60;
  var M = ("00" + (m % 60)).slice(-2);
  var S = ("00" + (s % 60)).slice(-2);

  return H + ':' + M + ':' + S;
};

controls.toggle = function(){
  this.elem.toggle();
  this.toggleVlcFix();
};

controls.toggleVlcFix = function(){
  var playerElem = this.player.elem;
  var parentElem = playerElem.parent();

  if (this.elem.is(':visible')) {
    this.elem.css('bottom', 0);
    playerElem.height(playerElem.height());
    parentElem.css('overflow', 'hidden');
    parentElem.height(playerElem.height() - this.elem.height());
  } else {
    playerElem.height('100%');
    parentElem.height('auto');
  }
};

controls.update = function(){
  var timeSeconds = this.player.getTime() / 1000;
  var durationSeconds = this.player.getDuration() / 1000;
  var progressPercent = Math.round(timeSeconds / durationSeconds * 100);
  var volumePercent = Math.round(this.player.getVolume() * 100);

  this.progressBarInner.width(progressPercent + '%');
  this.progressTime.text(this.formattedSeconds(timeSeconds));
  this.progressDuration.text(this.formattedSeconds(durationSeconds));
  this.volumeBarInner.width(volumePercent + '%');

  this.volumeIcon.removeClass('icon-volume-off');
  this.volumeIcon.removeClass('icon-volume-down');
  this.volumeIcon.removeClass('icon-volume-up');

  if (volumePercent == 0) {
    this.volumeIcon.addClass('icon-volume-off');
  } else if (volumePercent < 50) {
    this.volumeIcon.addClass('icon-volume-down');
  } else {
    this.volumeIcon.addClass('icon-volume-up');
  }
};

controls.pause = function(){
  this.player.pause();
  this.toggle();
  this.update();
};

controls.advance = function(){
  this.player.advance();
  this.update();
};

controls.reverse = function(){
  this.player.reverse();
  this.update();
};

controls.louder = function(){
  this.player.louder();
  this.update();
};

controls.quieter = function(){
  this.player.quieter();
  this.update();
};
