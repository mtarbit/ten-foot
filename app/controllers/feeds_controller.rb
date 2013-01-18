class FeedsController < ApplicationController
  def index
    @videos = YouTubeVideo.includes(:tweets).order('tweets.date DESC')
  end

  def show
    @video = YouTubeVideo.find(params[:id])
  end

  def populate_tweets
    m = Tweet.count
    Tweet.populate
    n = Tweet.count - m
    render text: "Created #{n} #{"record".pluralize(n)}"
  end
end
