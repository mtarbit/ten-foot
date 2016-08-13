// Player YouTube - YouTube iframe player API

var playerYouTube = {};

playerYouTube.type = 'youtube';
playerYouTube.IFRAME_API_URL = 'https://www.youtube.com/iframe_api';

playerYouTube.init = function(){
  this.containerId = 'youtube-player-container';
  this.container = $('#' + this.containerId);

  if (this.container.length) {
    this.loadApi();
    return this;
  }
};

playerYouTube.loadApi = function(){
  var self = this;
  var script = $('<script>').attr('src', this.IFRAME_API_URL);

  $('head').append(script);

  window.onYouTubeIframeAPIReady = function(){
    self.initApi();
  };
};

playerYouTube.initApi = function(){
  var self = this;

  this.api = new YT.Player(this.containerId, {
    'height': '100%',
    'width': '100%',
    'playerVars': {
      'autoplay': 1,
      'controls': 0
    },
    'events': {
      'onReady': function(event){
        self.onPlayerReady(event);
      },
      'onStateChange': function(event){
        self.onPlayerStateChange(event);
      },
    }
  });
};

playerYouTube.onPlayerReady = function(event){
  var videoId = this.container.data('video-id');
  this.api.loadVideoById(videoId);
  this.api.setVolume(50);
};

playerYouTube.onPlayerStateChange = function(event){
  if (event.data == this.STATES.ended) this.stop();
};

playerYouTube.STATES = {
    'unstarted': -1
  , 'ended':      0
  , 'playing':    1
  , 'paused':     2
  , 'buffering':  3
  , 'cued':       5
};

playerYouTube.is = function(state){
  return this.api.getPlayerState() == this.STATES[state];
};

playerYouTube.stop = function(){
  page.back();
};

playerYouTube.pause = function(){
  if (this.is('paused')) {
    this.api.playVideo();
  } else {
    this.api.pauseVideo();
  }
};

playerYouTube.advance = function(){
  this.api.seekTo(this.api.getCurrentTime() + 10, true);
};

playerYouTube.reverse = function(){
  this.api.seekTo(this.api.getCurrentTime() - 10, true);
};

playerYouTube.louder = function(){
  this.api.setVolume(Math.min(this.api.getVolume() + 10, 100));
};

playerYouTube.quieter = function(){
  this.api.setVolume(Math.max(this.api.getVolume() - 10, 0));
};

playerYouTube.getTime = function(){
  return this.api.getCurrentTime() * 1000;
};

playerYouTube.getDuration = function(){
  return this.api.getDuration() * 1000;
};

playerYouTube.getVolume = function(){
  return this.api.getVolume() / 100;
};
