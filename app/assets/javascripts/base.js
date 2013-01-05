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
        history.back();
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
        self.play();
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

page.top = function(){
  this.focus(this.minLinkIndex);
};

page.focusNearest = function(direction, axis){
  var a = this.links.eq(this.curLinkIndex);
  for (var i = 0; i < this.links.length; i++) {
    var b = this.links.eq(i);

    var dx = dir * a.offset().left - b.offset().left;
    var dy = dir * a.offset().top - b.offset().top;

    console.log(i, dx, dy);
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
  if (link) {
    link.addClass('active');

    var y1 = link.position().top;
    var h1 = link.height();
    var h2 = $(window).height();
    var buffer = parseFloat($('body').css('marginBottom'), 10);

    $('body').scrollTop(y1 + h1 + buffer - h2);
  }
};

page.play = function(){
  var url = this.links.eq(this.curLinkIndex).attr('href');
  if (url) location.href = url;
};


var player = {};

player.init = function(){
  this.elem = $('video');
  this.dom = this.elem.get(0);

  if (this.elem.length) {
    this.initEvents();
    this.initKeyboard();
  }
};

player.initEvents = function(){
  var self = this;

  this.elem.on('ended', function(){
    self.stop();
  });
};

player.initKeyboard = function(){
  var self = this;

  $(document).on('keydown', function(e){
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return true;

    var key = KEYS[e.which];
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
  page.init();
});

