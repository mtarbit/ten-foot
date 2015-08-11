class FeedsController < ApplicationController
  def index
    @videos = YouTubeVideo.eager_load(:tweets).order('COALESCE(tweets.date, published_at) DESC').limit(120)
  end

  def show
    @video = YouTubeVideo.find(params[:id])
  end

  def refresh
    YouTubeVideo.populate
    Tweet.populate
    redirect_to :back
  end
end
