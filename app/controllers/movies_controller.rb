class MoviesController < ApplicationController
  def index
    @movies = Movie.order(:title)
  end

  def show
    @movie = Movie.find(params[:id])
  end
end
