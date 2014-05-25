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
    @file.progress = params[:progress]
    @file.save!
    render nothing: true
  end

  def watched
    @file = VideoFile.find(params[:id])
    @file.toggle_watched(params[:watched])
    render nothing: true
  end

  def search
    @files = VideoFile.find(params[:ids].split(','))
    @first = @files.first

    @title = params[:title] || @first.title
    @year  = params[:year]  || @first.year
    @media = params[:media] || @first.media_type.try(:downcase)

    if params[:imdb_id] || params[:tvdb_id]
      if params[:imdb_id]
        result = ImdbService.fetch(params[:imdb_id])
        record = result && Movie.create_from_imdb(result)
      end
      if params[:tvdb_id]
        result = TvdbService.fetch(params[:tvdb_id])
        record = result && Series.create_from_tvdb(result)
      end

      raise "Couldn't fetch match" unless record

      @files.each {|file| file.media = record; file.save! }

      redirect_to url_for(controller: record.class.name.underscore.pluralize, action: :show, id: record.id)
    end

    if @media == 'movie'
      @matches = ImdbService.search(@title, @year)
    else
      @matches = TvdbService.search(@title, @year)
    end
  end

  def refresh
    Media.populate
    redirect_to :back
  end
end
