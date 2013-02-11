class FeedsController < ApplicationController
  def index
    @videos = YouTubeVideo.joins(:tweets).order('tweets.date DESC').limit(30)
  end

  def show
    @video = YouTubeVideo.find(params[:id])
  end
end
