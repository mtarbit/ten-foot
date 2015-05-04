class SeriesController < MediaController
  def index
    @series = Series.recent
  end

  def show
    @series = Series.find(params[:id])
    @video_files = @series.video_files.order('season NULLS FIRST, episode NULLS FIRST, path')
  end
end
