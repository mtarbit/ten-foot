class FeedsController < ApplicationController
  def index
    @videos = YouTubeVideo.includes(:tweets).order('tweets.date DESC')
  end

  def show
    @video = YouTubeVideo.find(params[:id])
  end
end
