// Player YouTube - YouTube chromeless player SWF

var playerYouTube = {};

playerYouTube.type = 'youtube';
playerYouTube.CHROMELESS_PLAYER_URL = "http://www.youtube.com/apiplayer?enablejsapi=1&version=3";

playerYouTube.init = function(){
  this.domId = 'feed-player';
  this.containerId = this.domId + '-container';
  this.container = $('#' + this.containerId);

  if (this.container.length) {
    this.initCallbacks();
    this.initDom();
    return this;
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
  };

  window.onYouTubePlayerStateChange = function(state) {
    if (state == self.STATES.ended) self.stop();
  };
};

playerYouTube.getDom = function(){
  this.elem = $('#' + this.domId);

  this.dom = this.elem.get(0);

  this.dom.addEventListener('onStateChange', 'onYouTubePlayerStateChange');
  this.dom.loadVideoById(this.videoId);
};

playerYouTube.STATES = {
    'unstarted': -1
  , 'ended':      0
  , 'playing':    1
  , 'paused':     2
  , 'buffering':  3
};

playerYouTube.is = function(state){
  return this.dom.getPlayerState() == this.STATES[state];
};

playerYouTube.stop = function(){
  page.back();
};

playerYouTube.pause = function(){
  if (this.is('paused')) {
    this.dom.playVideo();
  } else {
    this.dom.pauseVideo();
  }
};

playerYouTube.advance = function(){
  this.dom.seekTo(this.dom.getCurrentTime() + 10);
};

playerYouTube.reverse = function(){
  this.dom.seekTo(this.dom.getCurrentTime() - 10);
};

playerYouTube.louder = function(){
  this.dom.setVolume(Math.min(this.dom.getVolume() + 10, 100));
};

playerYouTube.quieter = function(){
  this.dom.setVolume(Math.max(this.dom.getVolume() - 10, 0));
};

playerYouTube.getTime = function(){
  return this.dom.getCurrentTime() * 1000;
};

playerYouTube.getDuration = function(){
  return this.dom.getDuration() * 1000;
};

playerYouTube.getVolume = function(){
  return this.dom.getVolume() / 100;
};

