class SeriesController < ApplicationController
  def index
    @series = Series.order(:title)
  end

  def show
    @series = Series.find(params[:id])
  end
end
