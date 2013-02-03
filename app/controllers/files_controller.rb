class FilesController < ApplicationController

  def index
    redirect_to file_path_path
  end

  def path
    @relpath = params[:path] || ''
    @abspath = File.join($settings.video_files_path, @relpath)

    if File.directory?(@abspath)

      @filenames = []
      Dir.foreach(@abspath) do |filename|
        @filenames << filename unless filename =~ /^\./
      end
      @filenames.sort!
      render :index

    else

      @file = VideoFile.where(path: params[:path]).first_or_create
      redirect_to file_path(@file)

    end
  end

  def show
    @file = VideoFile.find(params[:id])
  end

  def progress
    @file = VideoFile.find(params[:id])
    @file.time = params[:time]
    @file.save!
    render nothing: true
  end

  def watched
    @file = VideoFile.find(params[:id])
    @file.toggle_watched(params[:watched])
    render nothing: true
  end

end
