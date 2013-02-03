class SeriesController < ApplicationController
  def index
    @series = Series.recent.unwatched
  end

  def show
    @series = Series.find(params[:id])
  end

  def watched
    @movie = Series.find(params[:id])
    @movie.toggle_watched(params[:watched])
    render nothing: true
  end
end
