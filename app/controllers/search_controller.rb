class SearchController < ApplicationController
  def index
    @terms = params[:terms]
    @matches = YouTubeService.search(@terms) if @terms
  end

  def show
    @video_id = params[:id]
  end
end
