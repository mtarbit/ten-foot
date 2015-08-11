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

  def self.from_url(url)
    yid = url_to_yid(url)
    return unless yid

    res = YouTubeService.video(youtube_id)
    return unless res

    self.from_api(res)
  end

  def self.from_api(video)
    record = where(youtube_id: video.id).first_or_initialize
    return record unless record.new_record?

    record.image = video.snippet.thumbnails.high.url
    record.channel_title = video.snippet.channelTitle
    record.published_at = video.snippet.publishedAt
    record.title = video.snippet.title
    record.description = video.snippet.description
    record.save!

    record
  end

  def self.url_to_yid(url)
    m = url.match(URL_RE) || url.match(SHORT_URL_RE)
    m && m[1]
  end

  def self.populate(since=nil)
    unless since
      video = order('published_at DESC').eager_load(:tweets).where(tweets: {id: nil}).first
      since = video ? video.published_at : 7.days.ago
    end

    puts "========================================="

    video_ids = []
    videos = []

    channel_id = YouTubeService.channel_for_user($settings.youtube.username)

    playlist_ids = YouTubeService.subscription_playlist_ids(channel_id)
    playlist_ids.each do |id|
      video_ids_list = YouTubeService.playlist_video_ids(id)
      video_ids.push(*video_ids_list)
    end

    video_ids.each_slice(50) do |ids|
      videos_list = YouTubeService.videos(ids)
      videos.push(*videos_list)
    end

    videos = videos.select  {|v| v.snippet.publishedAt > since }
                   .sort_by {|v| v.snippet.publishedAt }

    puts "Received #{videos.count} results"

    puts "-----------------------------------------"
    videos.each do |video|
      record = self.from_api(video)
      puts "#{record.channel_title}: #{record.title}"
    end
    puts "-----------------------------------------"

  end
end
