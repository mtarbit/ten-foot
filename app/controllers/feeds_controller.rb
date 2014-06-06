class FeedsController < ApplicationController
  def index
    @tweets = Tweet
                .select('tweets.*, tytv.you_tube_video_id')
                .joins('JOIN (
                          SELECT
                            you_tube_video_id,
                            MIN(tweet_id) AS min_tweet_id
                          FROM tweets_you_tube_videos
                          GROUP BY you_tube_video_id
                        )
                        AS tytv
                        ON tytv.min_tweet_id = tweets.id')
                .order('tweets.date DESC')
                .limit(150)
  end

  def show
    @video = YouTubeVideo.find(params[:id])
  end

  def refresh
    Tweet.populate
    redirect_to :back
  end
end
