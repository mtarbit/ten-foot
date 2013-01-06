class FeedsController < ApplicationController
  def index
    @tweets = Tweet.order('date DESC')
  end

  def populate_tweets
    m = Tweet.count
    Tweet.populate
    n = Tweet.count - m
    render text: "Created #{n} #{"record".pluralize(n)}"
  end
end
