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

      case 'home':
        self.focusFirst();
        break;

      case 'end':
        self.focusLast();
        break;

      case 'shift-tab':
      case 'left':
      case 'h':
        self.prevHorizontal();
        break;
      case 'up':
      case 'k':
        self.prevVertical();
        break;

      case 'tab':
      case 'right':
      case 'l':
        self.nextHorizontal();
        break;
      case 'down':
      case 'j':
        self.nextVertical();
        break;

      case 'space':
      case 'enter':
        self.activate();
        break;

      case 'w':
        self.toggleWatched();
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

page.compassDirection = function(x, y) {
  var r = Math.abs(x / y);
  if (x >= 0 && y >= 0) return (r < 1) ? 'S':'E';
  if (x <= 0 && y >= 0) return (r < 1) ? 'S':'W';
  if (x >= 0 && y <= 0) return (r < 1) ? 'N':'E';
  if (x <= 0 && y <= 0) return (r < 1) ? 'N':'W';
};

page.focusFirst = function(){
  this.focus(this.minLinkIndex);
};

page.focusLast = function(){
  this.focus(this.maxLinkIndex);
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

page.toggleWatched = function(){
  var href = this.links.eq(this.curLinkIndex).attr('href');
  var hrefRE = /^\/(movies|series|files)\/\d+$/;
  if (hrefRE.test(href)) {
    $.ajax({
      url: href + '/watched',
      type: 'POST',
      data: { _method: 'PUT' }
    });
  }
};
