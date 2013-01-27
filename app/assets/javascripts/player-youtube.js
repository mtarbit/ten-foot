// Player YouTube - YouTube chromeless player SWF

var playerYouTube = {};

playerYouTube.CHROMELESS_PLAYER_URL = "http://www.youtube.com/apiplayer?enablejsapi=1&version=3";

playerYouTube.init = function(){
  this.domId = 'feed-player';
  this.containerId = this.domId + '-container';
  this.container = $('#' + this.containerId);

  if (this.container.length) {
    this.initCallbacks();
    this.initDom();
    this.initKeyboard();
  }
};

playerYouTube.initDom = function(){
  this.videoId = this.container.data('video-id');
  var parameters = { allowScriptAccess: 'always' };
  var attributes = { id: this.domId };
  swfobject.embedSWF(this.CHROMELESS_PLAYER_URL, this.containerId, '100%', '100%', '8', null, null, parameters, attributes);
};

playerYouTube.initCallbacks = function(){
  var self = this;

  window.onYouTubePlayerReady = function() {
    self.getDom();
  }

  window.onYouTubePlayerStateChange = function(state) {
    if (state == self.api.STATES.ended) self.stop();
  }
};

playerYouTube.getDom = function(){
  this.dom = $('#' + this.domId);
  this.dom.get(0).addEventListener('onStateChange', 'onYouTubePlayerStateChange');
  this.api.init();
  this.api.load(this.videoId);
}

playerYouTube.initKeyboard = function(){
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

playerYouTube.stop = function(){
  page.back();
};

playerYouTube.pause = function(){
  if (this.api.is('paused')) {
    this.api.play();
  } else {
    this.api.pause();
  }
};

// Player YouTube API - YouTube chromeless player API
// https://developers.google.com/youtube/js_api_reference

var playerYouTubeApi = playerYouTube.api = {};

playerYouTubeApi.STATES = {
    'unstarted': -1
  , 'ended':      0
  , 'playing':    1
  , 'paused':     2
  , 'buffering':  3
};

playerYouTubeApi.init = function(){ this.dom = playerYouTube.dom.get(0); };
playerYouTubeApi.load = function(id){ this.dom.loadVideoById(id); };
playerYouTubeApi.play = function(){ this.dom.playVideo(); };
playerYouTubeApi.pause = function(){ this.dom.pauseVideo(); };
playerYouTubeApi.advance = function(){ this.dom.seekTo(this.dom.getCurrentTime() + 10); };
playerYouTubeApi.reverse = function(){ this.dom.seekTo(this.dom.getCurrentTime() - 10); };

playerYouTubeApi.is = function(state){
  return this.dom.getPlayerState() == this.STATES[state];
};
