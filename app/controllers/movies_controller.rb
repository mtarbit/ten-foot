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
    render nothing: true
  end
end
