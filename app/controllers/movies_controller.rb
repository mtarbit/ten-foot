class MoviesController < MediaController
  def index
    @movies = Movie.recent.unwatched
  end

  def show
    @movie = Movie.find(params[:id])
    @video_files = @movie.video_files.order(:path)
  end
end
