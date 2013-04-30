class Movie < Media
  validates_presence_of :imdb_id
  validates_uniqueness_of :imdb_id

  def year
    release_date && release_date.split('-').first
  end

  def self.search(title, year = nil)
    self.where('title LIKE ?', title).first
  end

  def self.search_imdb(title, year = nil)
    result = ImdbService.search(title, year).first
    result && ImdbService.fetch(result[:imdb_id])
  end

  def self.create_from_imdb(result)
    record = self.where(imdb_id: result.imdb_id).first_or_initialize

    if record.new_record?
      record.title = result.title
      record.image = result.poster_url
      record.rating = result.rating
      record.description = result.plot
      record.runtime = result.runtime
      record.release_date = result.release_date
      record.save!
    end

    record
  end

  def self.create_from_video_file(vf)
    record = self.search(vf.title, vf.year)

    unless record
      result = self.search_imdb(vf.title, vf.year)
      record = result && self.create_from_imdb(result)
    end

    if record
      record.video_files << vf
    end

    record
  end

  def self.populate
    VideoFile.unmatched.matchable_as_movies.each do |vf|
      if self.create_from_video_file(vf)
        puts "Matched: #{vf}"
      else
        puts "No match for: #{vf}"
      end
    end
  end
end
