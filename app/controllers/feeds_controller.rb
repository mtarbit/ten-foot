class FeedsController < ApplicationController
  def index
    @videos = YouTubeVideo.select('DISTINCT you_tube_videos.*').joins(:tweets).order('tweets.date DESC').limit(100)
  end

  def show
    @video = YouTubeVideo.find(params[:id])
  end
end
