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
  $(document).on('keydown', function(e){
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

filesPlayerHtml5.init = function(){
  this.elem = $('video');
  this.dom = this.elem.get(0);

  if (this.elem.length) {
    this.initEvents();
    this.initKeyboard();
  }
};

filesPlayerHtml5.initEvents = function(){
  var self = this;

  this.elem.on('ended', function(){
    self.stop();
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

filesPlayerVlc.init = function(){
  this.elem = $('object[type="application/x-vlc-plugin"]');
  this.dom = this.elem.get(0);

  if (this.elem.length) {
    this.initEvents();
    this.initKeyboard();
  }
};

filesPlayerVlc.initEvents = function(){
  var self = this;

  this.elem.on('MediaPlayerEndReached', function(){
    self.stop();
  });
};

filesPlayerVlc.initKeyboard = function(){
  var self = this;

  keys.addHandler(function(key){
    switch (key) {
      case 'space': self.pause();   break;
      case 'rt':    self.advance(); break;
      case 'lt':    self.reverse(); break;
      default:      return false;   break;
    }

    return true;
  });
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

// Initialisers

$(function(){
  feedsPlayer.init();
  filesPlayerHtml5.init();
  filesPlayerVlc.init();
  page.init();
});

