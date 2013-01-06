class Tweet < ActiveRecord::Base
  has_and_belongs_to_many :you_tube_videos

  validates_presence_of :twitter_id
  validates_uniqueness_of :twitter_id

  RATE_LIMIT = 15
  RATE_RESET = 15 * 60

  def self.populate(options = {})
    unless options[:since_id]
      tweet = order('twitter_id DESC').first
      options[:since_id] = tweet.twitter_id if tweet
    end

    puts "========================================="

    requests = 0

    loop do

      requests += 1
      if requests > RATE_LIMIT
        puts "Made #{requests - 1} requests. Sleeping for #{RATE_RESET / 60} minutes."
        sleep RATE_RESET
      end

      puts "Making request using options: #{options.inspect}"

      begin
        results = Twitter.home_timeline(options)
        puts "Received #{results.count} results"
      rescue Twitter::Error::TooManyRequests => error
        puts "Too many requests: #{error.rate_limit.attrs.inspect}"
        return
      end

      return if results.empty?

      puts "-----------------------------------------"
      results.each do |data|
        record = from_twitter_data(data)
        puts "#{record.you_tube_videos.blank? ? '-' : record.you_tube_videos.count} #{data.id} @#{data.user.screen_name}: #{data.text[0,30]}..."
      end
      puts "-----------------------------------------"

      options[:max_id] = results.last.id - 1
    end
  end

  def self.from_twitter_data(data)
    record = where(twitter_id: data.id).first_or_initialize
    return record unless record.new_record?

    videos = data.urls.map {|data| YouTubeVideo.for_url(data.expanded_url) }.compact
    return record unless videos.present?

    record.user = data.user.screen_name
    record.icon = data.user.profile_image_url
    record.text = data.text
    record.date = data.created_at
    record.you_tube_videos = videos
    record.save!

    record
  end
end
