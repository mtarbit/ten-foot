class MoviesController < ApplicationController
  def index
    @movies = Movie.recent.unwatched
  end

  def show
    @movie = Movie.find(params[:id])
    @video_files = @movie.video_files.order(:path)
  end

  def watched
    @movie = Movie.find(params[:id])
    @movie.toggle_watched(params[:watched])

    respond_to do |format|
      format.html { redirect_to :back }
      format.js   { render nothing: true }
    end
  end
end
