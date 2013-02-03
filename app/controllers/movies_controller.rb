class MoviesController < ApplicationController
  def index
    @movies = Movie.recent.unwatched
  end

  def show
    @movie = Movie.find(params[:id])
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
