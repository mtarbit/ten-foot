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
