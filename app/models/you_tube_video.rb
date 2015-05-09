require 'open-uri'

class YouTubeVideo < ActiveRecord::Base
  include ImageCacheable

  has_and_belongs_to_many :tweets

  validates_presence_of :youtube_id
  validates_uniqueness_of :youtube_id

  URL_RE = %r{^https?://(?:www\.|m\.)?youtube\.com/watch\?(?:.*&)?v=([\w-]+)}
  SHORT_URL_RE = %r|^https?://youtu\.be/([\w-]+)|

  def url
    'http://www.youtube.com/watch?v=' + youtube_id
  end

  def self.for_url(url)
    yid = url_to_yid(url)

    return unless yid

    record = where(youtube_id: yid).first_or_initialize

    if record.new_record?
      api_res = YouTubeService.video(record.youtube_id)

      return unless api_res

      record.image = api_res.snippet.thumbnails.high.url
      record.title = api_res.snippet.title
      record.description = api_res.snippet.description
      record.save!
    end

    record
  end

  def self.url_to_yid(url)
    m = url.match(URL_RE) || url.match(SHORT_URL_RE)
    m && m[1]
  end
end
