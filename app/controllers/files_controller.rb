class FilesController < ApplicationController

  def index
    @relpath = params[:path] || ''
    @abspath = File.join($settings.video_files_path, @relpath)

    if File.directory?(@abspath)
      @filenames = []
      Dir.foreach(@abspath) do |filename|
        @filenames << filename unless filename =~ /^\./
      end
      @filenames
    else
      redirect_to file_path(params)
    end
  end

  def show
    @path = params[:path]
  end

  def populate_video_files
    populate_records(VideoFile)
  end

  def populate_movies
    populate_records(Movie)
  end

  def populate_series
    populate_records(Series)
  end

private

  def populate_records(klass)
    m = klass.count
    klass.populate
    n = m - klass.count
    render text: "Created #{n} #{records.pluralize(n)}"
  end

end
