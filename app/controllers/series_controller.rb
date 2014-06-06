class SeriesController < ApplicationController
  def index
    @series = Series.recent.unwatched
  end

  def show
    @series = Series.find(params[:id])
    @video_files = @series.video_files.order('season NULLS FIRST, episode NULLS FIRST, path')
  end

  def watched
    @series = Series.find(params[:id])
    @series.toggle_watched(params[:watched])

    respond_to do |format|
      format.html { redirect_to :back }
      format.js   { render nothing: true }
    end
  end

  def refresh
    Media.populate
    redirect_to :back
  end
end
