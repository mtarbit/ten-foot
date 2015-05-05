class MoviesController < MediaController
  def index
    @movies = Movie.recently_created.unwatched
  end

  def show
    @movie = Movie.find(params[:id])
    @video_files = @movie.video_files.order(:path)
  end
end
