class SeriesController < ApplicationController
  def index
    @series = Series.joins(:video_files).group('series.id').order('video_files.created_at DESC').to_a
  end

  def show
    @series = Series.find(params[:id])
  end
end
