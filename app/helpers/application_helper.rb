module ApplicationHelper
  def body_classes
    classes = []
    classes << controller_path.gsub(/a-z0-9/, '-')
    classes << "#{classes.first}-#{action_name}"
    classes.join(' ')
  end

  def minimal_tweet_text(text)
    t = text.dup
    t.gsub!(/^RT /, '<em>RT</em> ')
    t.gsub!(/(@\w+)/, '<em>\1</em>')
    t.gsub!(/(#\w+)/, '<em>\1</em>')
    t.gsub!(%r{https?://(\S+)}, '<em>http&hellip;</em>')
    t.html_safe
  end

  def minimal_video_text(text)
    t = text.dup
    t.gsub!(%r{https?://(\S+)}, '<em>http&hellip;</em>')
    t.html_safe
  end
end
