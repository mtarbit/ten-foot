class FilesController < ApplicationController

  def index
    @relpath = params[:path] || ''
    @abspath = File.join($settings.video_files_path, @relpath)

    if File.directory?(@abspath)
      @filenames = []
      Dir.foreach(@abspath) do |filename|
        @filenames << filename unless filename =~ /^\./
      end
      @filenames.sort!
    else
      redirect_to file_path(params)
    end
  end

  def show
    @file = VideoFile.where(path: params[:path]).first_or_create
  end

end
