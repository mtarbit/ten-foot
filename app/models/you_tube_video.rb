require 'open-uri'

class YouTubeVideo < ActiveRecord::Base
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
      api_url = yid_to_api_url(yid)
      api_res = open(api_url).read

      data = JSON.parse(api_res)
      data_group = data['entry']['media$group']

      record.youtube_id = data_group['yt$videoid']['$t']
      record.image = data_group['media$thumbnail'][1]['url']
      record.title = data_group['media$title']['$t']
      record.description = data_group['media$description']['$t']
      record.save!
    end

    record
  end

  def self.url_to_yid(url)
    m = url.match(URL_RE) || url.match(SHORT_URL_RE)
    m && m[1]
  end

  def self.yid_to_api_url(yid)
    'http://gdata.youtube.com/feeds/api/videos/' + yid + '?v=2&alt=json'
  end
end
