class MoviesController < ApplicationController
  def index
    @movies = Movie.recent.unwatched
  end

  def show
    @movie = Movie.find(params[:id])
  end
end
