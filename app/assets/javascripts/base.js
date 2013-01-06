var KEYS = {
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

  this.focus(this.minLinkIndex);
};

page.initKeyboard = function(){
  var self = this;

  $(document).on('keydown', function(e){
    var key = KEYS[e.which];

    if (e.altKey || e.ctrlKey || e.metaKey) return true;
    if (e.shiftKey) key = 'shift-' + key;

    var caught = true;

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
        // self.prevHorizontal();
        // break;
      case 'up':
      case 'k':
        // self.prevVertical();
        self.prev();
        break;

      case 'tab':
      case 'rt':
      case 'l':
        // self.nextHorizontal();
        // break;
      case 'dn':
      case 'j':
        // self.nextVertical();
        self.next();
        break;

      case 'space':
      case 'enter':
        self.activate();
        break;

      default:
        caught = false;
        break;
    }

    if (caught) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  });
};

page.back = function(){
  history.back();
};

page.top = function(){
  this.focus(this.minLinkIndex);
};

page.focusNearest = function(direction, axis){
  var a = this.links.eq(this.curLinkIndex);
  if (a.length) {
    for (var i = 0; i < this.links.length; i++) {
      var b = this.links.eq(i);

      var dx = dir * a.offset().left - b.offset().left;
      var dy = dir * a.offset().top - b.offset().top;

      console.log(i, dx, dy);
    }
  }
};

page.prevHorizontal = function(){ this.focusNearest(-1, 'x'); };
page.prevVertical   = function(){ this.focusNearest(-1, 'y'); };
page.nextHorizontal = function(){ this.focusNearest(+1, 'x'); };
page.nextVertical   = function(){ this.focusNearest(+1, 'y'); };

page.prev = function(){
  this.focus(this.curLinkIndex - 1);
};

page.next = function(){
  this.focus(this.curLinkIndex + 1);
};

page.focus = function(n){
  if (n < this.minLinkIndex) n = this.minLinkIndex;
  if (n > this.maxLinkIndex) n = this.maxLinkIndex;

  this.curLinkIndex = n;
  this.links.removeClass('active');

  var link = this.links.eq(n);
  if (link.length) {
    link.addClass('active');

    var y1 = link.position().top;
    var h1 = link.height();
    var h2 = $(window).height();
    var buffer = parseFloat($('body').css('marginBottom'), 10);

    $('body').scrollTop(y1 + h1 + buffer - h2);
  }
};

page.activate = function(){
  var url = this.links.eq(this.curLinkIndex).attr('href');
  if (url) location.href = url;
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

  $(document).on('keydown', function(e){
    var key = KEYS[e.which];

    if (e.altKey || e.ctrlKey || e.metaKey) return true;
    if (e.shiftKey) key = 'shift-' + key;

    var caught = true;

    switch (key) {
      case 'space': self.pause(); break;

      default:
        caught = false;
        break;
    }

    if (caught) e.stopImmediatePropagation();
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

feedsPlayerApi.is = function(state){
  return this.dom.getPlayerState() == this.STATES[state];
};

// Files Player - HTML5 video element

var filesPlayer = {};

filesPlayer.init = function(){
  this.elem = $('video');
  this.dom = this.elem.get(0);

  if (this.elem.length) {
    this.initEvents();
    this.initKeyboard();
  }
};

filesPlayer.initEvents = function(){
  var self = this;

  this.elem.on('ended', function(){
    self.stop();
  });
};

filesPlayer.initKeyboard = function(){
  var self = this;

  $(document).on('keydown', function(e){
    var key = KEYS[e.which];

    if (e.altKey || e.ctrlKey || e.metaKey) return true;
    if (e.shiftKey) key = 'shift-' + key;

    var caught = true;

    switch (key) {
      case 'space': self.pause();   break;
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

filesPlayer.showControls = function(){
  this.elem.attr('controls', 'controls');
};

filesPlayer.hideControls = function(){
  this.elem.removeAttr('controls');
};

filesPlayer.stop = function(){
  page.back();
};

filesPlayer.play = function(){
  this.dom.play();
  this.hideControls();
};

filesPlayer.pause = function(){
  if (this.dom.paused) {
    this.play();
  } else {
    this.dom.pause();
    this.showControls();
  }
};

filesPlayer.advance = function(){
  this.dom.currentTime += 10;
};

filesPlayer.reverse = function(){
  this.dom.currentTime -= 10;
};

filesPlayer.louder = function(){
  this.dom.volume = Math.min(this.dom.volume + 0.1, 1.0);
};

filesPlayer.quieter = function(){
  this.dom.volume = Math.max(this.dom.volume - 0.1, 0.0);
};

$(function(){
  feedsPlayer.init();
  filesPlayer.init();
  page.init();
});

