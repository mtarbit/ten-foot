// For specifics of key code support see:
// http://www.quirksmode.org/js/keys.html

var keys = {};

keys.lookup = {
     8: 'backspace'
  ,  9: 'tab'
  , 13: 'enter'
  , 27: 'esc'
  , 32: 'space'
  , 33: 'page-up'
  , 34: 'page-down'
  , 35: 'end'
  , 36: 'home'
  , 37: 'left'
  , 39: 'right'
  , 38: 'up'
  , 40: 'down'
  , 46: 'delete'
};

keys.name = function(e){
  var code = e.keyCode;

  var isAtoZ = code >= 65 && code <= 90;
  var is0to9 = code >= 48 && code <= 57;
  var isMeta = code == 91 || code == 93 || (code >= 16 && code <= 18);

  var char, meta = [];

  if (e.metaKey) meta.push('cmd');
  if (e.ctrlKey) meta.push('ctrl');
  if (e.altKey)  meta.push('alt');

  if (e.shiftKey) {
    if (isAtoZ) {
      char = String.fromCharCode(code);
    } else {
      meta.push('shift');
    }
  } else if (isAtoZ) {
    char = String.fromCharCode(code + 32);
  } else if (is0to9) {
    char = '' + (code - 48);
  }

  if (!char && !isMeta) {
    char = this.lookup[code] || '[' + code + ']';
  }

  if (meta.length) {
    if (char) meta.push(char);
    char = meta.join('-');
  }

  return char;
};

keys.addHandler = function(handler){
  $(document).keydown(function(e){
    var caught = handler(keys.name(e));
    if (caught) e.stopImmediatePropagation();
  });
};
