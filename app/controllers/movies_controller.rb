class MoviesController < ApplicationController
  def index
    @movies = Movie.recent
  end

  def show
    @movie = Movie.find(params[:id])
  end
end
