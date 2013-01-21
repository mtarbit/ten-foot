class MoviesController < ApplicationController
  def index
    # @movies = Movie.joins(:video_files).group('movies.id').order('video_files.created_at DESC').to_a
    @movies = Movie.order('created_at DESC')
  end

  def show
    @movie = Movie.find(params[:id])
  end
end
