class Tweet < ActiveRecord::Base
  include ImageCacheable

  has_and_belongs_to_many :you_tube_videos

  validates_presence_of :twitter_id
  validates_uniqueness_of :twitter_id

  RATE_REQUESTS_CHUNK = 15
  RATE_REQUESTS_LIMIT = RATE_REQUESTS_CHUNK * 10
  RATE_SLEEP = 15 * 60

  def self.populate(options = {})
    unless options[:since_id]
      tweet = order('twitter_id DESC').first
      options[:since_id] = tweet.twitter_id.to_s if tweet
    end

    puts "========================================="

    requests = 0

    loop do

      begin

        if requests >= RATE_REQUESTS_LIMIT
          puts "Made the maximum number of requests. Stopping."
          return
        elsif requests >= RATE_REQUESTS_CHUNK
          puts "Made #{requests} requests. Sleeping for #{RATE_SLEEP / 60} minutes."
          sleep RATE_SLEEP
          requests = 0
        else
          requests += 1
        end

        puts "Making request at #{DateTime.now} using options: #{options.inspect}"
        results = Twitter.home_timeline(options)

      rescue Twitter::Error::TooManyRequests => error
        puts "Too many requests: #{error.rate_limit.attrs.inspect}"
        return
      rescue Timeout::Error => error
        puts "Request timed out. Retrying."
        retry
      end

      puts "Received #{results.count} results"

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
    record = where(twitter_id: data.id.to_s).first_or_initialize
    return record unless record.new_record?

    videos = data.urls.map {|data| YouTubeVideo.for_url(data.expanded_url) }.compact
    return record unless videos.present?

    record.user = data.user.screen_name
    record.text = data.text
    record.date = data.created_at
    record.image = data.user.profile_image_url
    record.you_tube_videos = videos
    record.save!

    record
  end
end
