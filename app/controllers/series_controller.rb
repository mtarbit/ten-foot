class SeriesController < ApplicationController
  def index
    @series = Series.recent
  end

  def show
    @series = Series.find(params[:id])
  end
end
