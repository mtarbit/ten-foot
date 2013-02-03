class Movie < Media
  validates_presence_of :imdb_id
  validates_uniqueness_of :imdb_id

  def year
    release_date && release_date.split('-').first
  end

  def self.from_imdb_result(result)
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

  def self.populate
    VideoFile.unmatched.matchable_as_movies.each do |vf|
      record = self.where('title LIKE ?', vf.title).first

      record ||= begin
        result = ImdbService.search(vf.title, vf.year).first
        result && self.from_imdb_result(ImdbService.fetch(result[:imdb_id]))
      end

      if record
        record.video_files << vf
        puts "Matched: #{vf}"
      else
        puts "No match for: #{vf}"
      end
    end
  end
end
