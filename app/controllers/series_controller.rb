class SeriesController < ApplicationController
  def index
    @series = Series.recent.unwatched
  end

  def show
    @series = Series.find(params[:id])
  end
end
