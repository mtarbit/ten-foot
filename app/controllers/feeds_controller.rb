class FeedsController < ApplicationController
  def index
    @videos = YouTubeVideo.includes(:tweets).order('tweets.date DESC').limit(120)
  end

  def show
    @video = YouTubeVideo.find(params[:id])
  end

  def refresh
    Tweet.populate
    redirect_to :back
  end
end
