// Page - generic keyboard-driven page navigation

var page = {};

page.init = function(){
  this.initElems();
  this.initLinks();
  this.initKeyboard();
};

page.initElems = function(){
  this.elems = $('a, :input:visible');

  this.minElemIndex = 0;
  this.maxElemIndex = this.elems.length - 1;

  this.elemOffsetCache = {};
  for (var i = 0; i < this.elems.length; i++) {
    this.elemOffsetCache[i] = this.elems.eq(i).offset();
  }

  this.focus(this.findActivatedLinkIndex());
};

page.initLinks = function(){
  $('a').click(function(e){
    var link = $(this);
    var href = link.attr('href');

    if (link.hasClass('submit')) {
      link.closest('form').submit();
    } else if (href) {
      history.replaceState({ activatedHref: href });
      location.href = href;
    }

    e.preventDefault();
  });
};

page.initKeyboard = function(){
  var self = this;
  keys.addHandler(function(key){
    if (self.keyHandlerGeneral(key)) return true;
    if (self.keyHandlerNonText(key)) return true;
    return false;
  });
};

page.keyHandlerGeneral = function(key){
  switch (key) {
    case 'esc':
      this.back();
      break;

    case 'home':
      this.focusFirst();
      break;

    case 'end':
      this.focusLast();
      break;

    case 'shift-tab':
      this.prev();
      break;
    case 'tab':
      this.next();
      break;

    default:
      return false;
      break;
  }

  return true;
};

page.keyHandlerNonText = function(key){
  if (this.elem().is('input[type="text"], textarea')) return false;

  switch (key) {
    case 'left':
    case 'h':
      this.prevHorizontal();
      break;
    case 'up':
    case 'k':
      this.prevVertical();
      break;

    case 'right':
    case 'l':
      this.nextHorizontal();
      break;
    case 'down':
    case 'j':
      this.nextVertical();
      break;

    case 'w':
      this.toggleWatched();
      break;

    case 'space':
    case 'enter':
      this.activate();
      break;

    default:
      return false;
      break;
  }

  return true;
};

page.is = function(className) {
  return $('body').hasClass(className);
};

page.back = function(){
  history.back();
};

page.focusFirst = function(){
  this.focus(this.minElemIndex);
};

page.focusLast = function(){
  this.focus(this.maxElemIndex);
};

page.focusNearest = function(direction){
  var i = this.curElemIndex;
  var iOff = this.elemOffsetCache[i];

  var candidates = [];

  for (var j = 0; j < this.elems.length; j++) {
    if (j == i) continue;

    var jOff = this.elemOffsetCache[j];

    var x = jOff.left - iOff.left;
    var y = jOff.top - iOff.top;

    if (direction == 'N' && y >= 0) continue;
    if (direction == 'E' && x <= 0) continue;
    if (direction == 'W' && x >= 0) continue;
    if (direction == 'S' && y <= 0) continue;

    candidates.push({ x: Math.abs(x), y: Math.abs(y), index: j });
  }

  if (candidates.length) {
    candidates.sort(
      (direction == 'W' || direction == 'E')
      ? page.sortHorizontal
      : page.sortVertical
    );

    this.focus(candidates[0].index);
  }
};

page.sortHorizontal = function(a, b){
  if (a.y < b.y) return -1;
  if (a.y > b.y) return  1;
  if (a.x < b.x) return -1;
  if (a.x > b.x) return  1;
  return 0;
};

page.sortVertical = function(a, b){
  if (a.x < b.x) return -1;
  if (a.x > b.x) return  1;
  if (a.y < b.y) return -1;
  if (a.y > b.y) return  1;
  return 0;
};

page.prevHorizontal = function(){ this.focusNearest('W'); };
page.prevVertical   = function(){ this.focusNearest('N'); };
page.nextHorizontal = function(){ this.focusNearest('E'); };
page.nextVertical   = function(){ this.focusNearest('S'); };

page.prev = function(){
  this.focus(this.curElemIndex - 1);
};

page.next = function(){
  this.focus(this.curElemIndex + 1);
};

page.focus = function(n){
  if (n < this.minElemIndex) n = this.minElemIndex;
  if (n > this.maxElemIndex) n = this.maxElemIndex;

  var prev = this.elems.eq(this.curElemIndex);
  if (prev.length) prev.removeClass('active');

  this.curElemIndex = n;

  var elem = this.elems.eq(n);
  if (elem.length) {
    elem.focus();

    if (elem.is('a')) {
      elem.addClass('active');
    }

    var y1 = elem.offset().top;
    var h1 = elem.height() / 2;
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

page.elem = function(){
  return this.elems.eq(this.curElemIndex);
};

page.findActivatedLinkIndex = function(){
  var index = this.minElemIndex;

  var pathA = history.state && history.state.activatedHref;
  if (pathA) {
    for (var i = 0; i < this.elems.length; i++) {
      var pathB = this.elems.eq(i).attr('href');
      if (pathA == pathB) { index = i; break; }
    }
  }

  return index;
};

page.activate = function(){
  this.elem().click();
};

page.toggleWatched = function(){
  var href = this.elem().attr('href');
  var hrefRE = /^\/(movies|series|files)\/\d+$/;
  if (hrefRE.test(href)) {
    $.ajax({
      url: href + '/watched',
      type: 'POST',
      data: { _method: 'PUT' }
    });
  }
};
