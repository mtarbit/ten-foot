// Keys - keyboard event handling

var keys = {};

keys.NAMES = {
      9: 'tab'
  ,  13: 'enter'
  ,  27: 'esc'
  ,  32: 'space'
  ,  37: 'lt'
  ,  39: 'rt'
  ,  38: 'up'
  ,  40: 'dn'
  ,  72: 'h'
  ,  74: 'j'
  ,  75: 'k'
  ,  76: 'l'
  , 190: '.'
};

keys.addHandler = function(handler){
  $(document).keydown(function(e){
    var key = keys.NAMES[e.which];

    if (e.altKey || e.ctrlKey || e.metaKey) return true;
    if (e.shiftKey) key = 'shift-' + key;

    var caught = handler(key);
    if (caught) e.stopImmediatePropagation();
  });
};

// Page - generic keyboard-driven link navigation

var page = {};

page.init = function(){
  this.initLinks();
  this.initKeyboard();
};

page.initLinks = function(){
  this.links = $('a');

  this.minLinkIndex = 0;
  this.maxLinkIndex = this.links.length - 1;

  this.linkOffsetCache = {};
  for (var i = 0; i < this.links.length; i++) {
    this.linkOffsetCache[i] = this.links.eq(i).offset();
  }

  this.focus(this.findActivatedLinkIndex());
};

page.initKeyboard = function(){
  var self = this;

  keys.addHandler(function(key){
    switch (key) {
      case 'esc':
        self.back();
        break;

      case '.':
        self.top();
        break;

      case 'shift-tab':
      case 'lt':
      case 'h':
        self.prevHorizontal();
        break;
      case 'up':
      case 'k':
        self.prevVertical();
        break;

      case 'tab':
      case 'rt':
      case 'l':
        self.nextHorizontal();
        break;
      case 'dn':
      case 'j':
        self.nextVertical();
        break;

      case 'space':
      case 'enter':
        self.activate();
        break;

      default:
        return false;
        break;
    }

    return true;
  });
};

page.is = function(className) {
  return $('body').hasClass(className);
};

page.back = function(){
  history.back();
};

page.top = function(){
  this.focus(this.minLinkIndex);
};

page.compassDirection = function(x, y) {
  var r = Math.abs(x / y);
  if (x >= 0 && y >= 0) return (r < 1) ? 'S':'E';
  if (x <= 0 && y >= 0) return (r < 1) ? 'S':'W';
  if (x >= 0 && y <= 0) return (r < 1) ? 'N':'E';
  if (x <= 0 && y <= 0) return (r < 1) ? 'N':'W';
};

page.focusNearest = function(direction){
  var i = this.curLinkIndex;
  var iOff = this.linkOffsetCache[i];

  var nearestDelta = null;
  var nearestIndex = null;

  for (var j = 0; j < this.links.length; j++) {
    if (j == i) continue;

    var jOff = this.linkOffsetCache[j];

    var x = jOff.left - iOff.left;
    var y = jOff.top - iOff.top;

    if (page.compassDirection(x, y) != direction) continue;

    var delta = Math.round(Math.sqrt((x * x) + (y * y)));
    if (delta < nearestDelta || nearestDelta == null) {
      nearestDelta = delta;
      nearestIndex = j;
    }
  }

  if (nearestIndex != null) {
    this.focus(nearestIndex);
  }
};

page.prevHorizontal = function(){ this.focusNearest('W'); };
page.prevVertical   = function(){ this.focusNearest('N'); };
page.nextHorizontal = function(){ this.focusNearest('E'); };
page.nextVertical   = function(){ this.focusNearest('S'); };

page.prev = function(){
  this.focus(this.curLinkIndex - 1);
};

page.next = function(){
  this.focus(this.curLinkIndex + 1);
};

page.focus = function(n){
  if (n < this.minLinkIndex) n = this.minLinkIndex;
  if (n > this.maxLinkIndex) n = this.maxLinkIndex;

  var prev = this.links.eq(this.curLinkIndex);
  if (prev.length) prev.removeClass('active');

  this.curLinkIndex = n;

  var link = this.links.eq(n);
  if (link.length) {
    link.addClass('active');

    var y1 = link.offset().top;
    var h1 = link.height() / 2;
    var h2 = $(window).height() / 2;

    if (prev.length && prev.offset().top == y1) return;

    if (n == 0) {
      var y = 0;
    } else {
      var y = y1 + h1 - h2;
    }

    $('body').scrollTop(y);
  }
};

page.findActivatedLinkIndex = function(){
  var index = this.minLinkIndex;

  var pathA = history.state && history.state.activatedHref;
  if (pathA) {
    for (var i = 0; i < this.links.length; i++) {
      var pathB = this.links.eq(i).attr('href');
      if (pathA == pathB) { index = i; break; }
    }
  }

  return index;
};

page.activate = function(){
  var href = this.links.eq(this.curLinkIndex).attr('href');
  if (href) {
    history.replaceState({ activatedHref: href });
    location.href = href;
  }
};

// Saver - screen saving after a period of inactivity

var saver = {};

saver.TIMER_DELAY = 5 * 60 * 1000;

saver.init = function(){
  if (page.is('feeds-show') || page.is('files-show')) return;

  var self = this;

  this.canvas = $('<canvas>');
  this.canvas.css({ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, display: 'none' });

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
  this.h = this.canvas.width();
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

// Feeds Player - YouTube chromeless player SWF

var feedsPlayer = {};

feedsPlayer.CHROMELESS_PLAYER_URL = "http://www.youtube.com/apiplayer?enablejsapi=1&version=3";

feedsPlayer.init = function(){
  this.domId = 'feed-player';
  this.containerId = this.domId + '-container';
  this.container = $('#' + this.containerId);

  if (this.container.length) {
    this.initCallbacks();
    this.initDom();
    this.initKeyboard();
  }
};

feedsPlayer.initDom = function(){
  this.videoId = this.container.data('video-id');
  var parameters = { allowScriptAccess: 'always' };
  var attributes = { id: this.domId };
  swfobject.embedSWF(this.CHROMELESS_PLAYER_URL, this.containerId, '100%', '100%', '8', null, null, parameters, attributes);
};

feedsPlayer.initCallbacks = function(){
  var self = this;

  window.onYouTubePlayerReady = function() {
    self.getDom();
  }

  window.onYouTubePlayerStateChange = function(state) {
    if (state == self.api.STATES.ended) self.stop();
  }
};

feedsPlayer.getDom = function(){
  this.dom = $('#' + this.domId);
  this.dom.get(0).addEventListener('onStateChange', 'onYouTubePlayerStateChange');
  this.api.init();
  this.api.load(this.videoId);
}

feedsPlayer.initKeyboard = function(){
  var self = this;

  keys.addHandler(function(key){
    switch (key) {
      case 'space': self.pause(); break;
      case 'rt':    self.api.advance(); break;
      case 'lt':    self.api.reverse(); break;
      default:      return false; break;
    }

    return true;
  });
}

feedsPlayer.stop = function(){
  page.back();
};

feedsPlayer.pause = function(){
  if (this.api.is('paused')) {
    this.api.play();
  } else {
    this.api.pause();
  }
};

// Feeds Player API - YouTube chromeless player API
// https://developers.google.com/youtube/js_api_reference

var feedsPlayerApi = feedsPlayer.api = {};

feedsPlayerApi.STATES = {
    'unstarted': -1
  , 'ended':      0
  , 'playing':    1
  , 'paused':     2
  , 'buffering':  3
};

feedsPlayerApi.init = function(){ this.dom = feedsPlayer.dom.get(0); };
feedsPlayerApi.load = function(id){ this.dom.loadVideoById(id); };
feedsPlayerApi.play = function(){ this.dom.playVideo(); };
feedsPlayerApi.pause = function(){ this.dom.pauseVideo(); };
feedsPlayerApi.advance = function(){ this.dom.seekTo(this.dom.getCurrentTime() + 10); };
feedsPlayerApi.reverse = function(){ this.dom.seekTo(this.dom.getCurrentTime() - 10); };

feedsPlayerApi.is = function(state){
  return this.dom.getPlayerState() == this.STATES[state];
};

// Files Player - HTML5 video element

var filesPlayerHtml5 = {};

filesPlayerHtml5.lastTimeChange = 0;

filesPlayerHtml5.init = function(){
  this.elem = $('video');

  if (this.elem.length) {
    this.dom = this.elem.get(0);

    this.initEvents();
    this.initKeyboard();
  }
};

filesPlayerHtml5.initEvents = function(){
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

filesPlayerHtml5.initKeyboard = function(){
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

filesPlayerHtml5.checkProgress = function(){
  var currTimeChange = this.time();
  if (currTimeChange > this.lastTimeChange + (15 * 1000)) {
    this.updateProgress();
    this.lastTimeChange = currTimeChange;
  }
};

filesPlayerHtml5.updateProgress = function(){
  $.ajax({
    url: location.pathname + '/progress',
    type: 'POST',
    data: { time: this.time(), _method: 'PUT' }
  });
};

filesPlayerHtml5.time = function(){
  return Math.round(this.dom.currentTime * 1000);
};

filesPlayerHtml5.showControls = function(){
  this.elem.attr('controls', 'controls');
};

filesPlayerHtml5.hideControls = function(){
  this.elem.removeAttr('controls');
};

filesPlayerHtml5.stop = function(){
  page.back();
};

filesPlayerHtml5.play = function(){
  this.dom.play();
  this.hideControls();
};

filesPlayerHtml5.pause = function(){
  if (this.dom.paused) {
    this.play();
  } else {
    this.dom.pause();
    this.showControls();
  }
};

filesPlayerHtml5.advance = function(){
  this.dom.currentTime += 10;
};

filesPlayerHtml5.reverse = function(){
  this.dom.currentTime -= 10;
};

filesPlayerHtml5.louder = function(){
  this.dom.volume = Math.min(this.dom.volume + 0.1, 1.0);
};

filesPlayerHtml5.quieter = function(){
  this.dom.volume = Math.max(this.dom.volume - 0.1, 0.0);
};

// Files Player - VLC plugin element

var filesPlayerVlc = {};

filesPlayerVlc.lastTimeChange = 0;

filesPlayerVlc.init = function(){
  this.elem = $('object[type="application/x-vlc-plugin"]');

  if (this.elem.length) {
    this.dom = this.elem.get(0);
    this.dom.audio.volume = 50;

    this.initEvents();
    this.initKeyboard();
  }
};

filesPlayerVlc.initEvents = function(){
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

filesPlayerVlc.initKeyboard = function(){
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

filesPlayerVlc.checkProgress = function(){
  var currTimeChange = this.time();
  if (currTimeChange > this.lastTimeChange + (15 * 1000)) {
    this.updateProgress();
    this.lastTimeChange = currTimeChange;
  }
};

filesPlayerVlc.updateProgress = function(){
  $.ajax({
    url: location.pathname + '/progress',
    type: 'POST',
    data: { time: this.time(), _method: 'PUT' }
  });
};

filesPlayerVlc.time = function(){
  return this.dom.input.time;
};

filesPlayerVlc.stop = function(){
  page.back();
};

filesPlayerVlc.pause = function(){
  this.dom.playlist.togglePause();
};

filesPlayerVlc.advance = function(){
  this.dom.input.time += 10 * 1000;
};

filesPlayerVlc.reverse = function(){
  this.dom.input.time -= 10 * 1000;
};

filesPlayerVlc.louder = function(){
  this.dom.volume = Math.min(this.dom.volume + 10, 200);
};

filesPlayerVlc.quieter = function(){
  this.dom.volume = Math.max(this.dom.volume - 10, 0);
};

// Initialisers

$(function(){
  saver.init();
  feedsPlayer.init();
  filesPlayerHtml5.init();
  filesPlayerVlc.init();
  page.init();
});

