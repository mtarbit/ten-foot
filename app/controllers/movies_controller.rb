class MoviesController < ApplicationController
  def index
    # @movies = Movie.order(:title)
    @movies = Movie.
              select('DISTINCT movies.*').
              joins(:video_files).
              where("video_files.extension != 'avi'").
              order(:title)
  end

  def show
    @movie = Movie.find(params[:id])
  end
end
