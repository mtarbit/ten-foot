var player;

$(function(){
  saver.init();

  player = player || playerYouTube.init();
  player = player || playerHtml5.init();
  player = player || playerVlc.init();
  controls.init(player);

  page.init();
});
