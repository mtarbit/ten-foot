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
    VideoFile.delete_all

    Dir.chdir($settings.video_files_path)
    Dir.glob('**/*.{' + VideoFile::EXTENSIONS.join(',') + '}').each do |path|
      VideoFile.create!(path: path)
    end

    render text: "Created #{VideoFile.count} records"
  end

  def populate_movies
    Movie.delete_all

    imdb = ImdbParty::Imdb.new(anonymize: true)
    VideoFile.movies.each do |vf|
      movie = Movie.where('title LIKE ?', vf.title).first

      unless movie
        results = imdb.find_by_title(vf.title)
        next if results.empty?
        results = results.sort do |a,b|
          a_score = 0
          b_score = 0

          a_score += 1 if a[:title].downcase == vf.title
          a_score += 1 if a[:year] == vf.year

          b_score += 1 if b[:title].downcase == vf.title
          b_score += 1 if b[:year] == vf.year

          b_score <=> a_score
        end if vf.year

        imdb_movie = imdb.find_movie_by_id(results.first[:imdb_id])

        movie = Movie.where(imdb_id: imdb_movie.imdb_id).first_or_initialize
        if movie.new_record?
          movie.imdb_id = imdb_movie.imdb_id
          movie.title = imdb_movie.title
          movie.image = imdb_movie.poster_url
          movie.rating = imdb_movie.rating
          movie.description = imdb_movie.plot
          movie.runtime = imdb_movie.runtime
          movie.release_date = imdb_movie.release_date
          movie.save!
        end
      end

      movie.video_files << vf
    end

    render text: "Created #{Movie.count} records"
  end

  def populate_series
    Series.delete_all

    tvdb = TvdbParty::Search.new($settings.tvdb_api_key)
    VideoFile.series.each do |vf|
      series = Series.where('title LIKE ?', vf.title).first

      unless series
        results = tvdb.search(vf.title)
        next if results.empty?
        results = results.sort do |a,b|
          a_score = 0
          b_score = 0

          a_score += 1 if a['SeriesName'].downcase == vf.title
          a_score += 1 if a['FirstAired'].split('-')[0] == vf.year

          b_score += 1 if b['SeriesName'].downcase == vf.title
          b_score += 1 if b['FirstAired'].split('-')[0] == vf.year

          b_score <=> a_score
        end if vf.year

        tvdb_series = tvdb.get_series_by_id(results.first['id'])

        series = Series.where(tvdb_id: tvdb_series.id).first_or_initialize
        if series.new_record?
          series.tvdb_id = tvdb_series.id
          series.title = tvdb_series.name
          series.image = tvdb_series.posters('en').first.url rescue nil
          series.rating = tvdb_series.rating
          series.description = tvdb_series.overview
          series.save!
        end
      end

      series.video_files << vf
    end

    render text: "Created #{Series.count} records"
  end

end
