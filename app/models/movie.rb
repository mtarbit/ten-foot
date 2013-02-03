class Movie < Media
  validates_presence_of :imdb_id
  validates_uniqueness_of :imdb_id

  def year
    release_date && release_date.split('-').first
  end

  def self.imdb
    @@imdb ||= ImdbParty::Imdb.new(anonymize: true)
  end

  def self.matches(title, year = nil)
    results = imdb.find_by_title(title)

    results = results.sort do |a,b|
      a_score = 0
      b_score = 0

      a_score += 1 if self.imdb_title_eq(a[:title], title)
      a_score += 1 if self.imdb_year_eq(a[:year], year)

      b_score += 1 if self.imdb_title_eq(b[:title], title)
      b_score += 1 if self.imdb_year_eq(b[:year], year)

      b_score <=> a_score
    end if year

    results
  end

  def self.from_imdb_id(imdb_id)
    result = imdb.find_movie_by_id(imdb_id)
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
        result = self.matches(vf.title, vf.year).first
        result && self.from_imdb_id(result[:imdb_id])
      end

      if record
        record.video_files << vf
        puts "Matched: #{vf.to_s}"
      else
        puts "No match for: #{vf.to_s}"
      end
    end
  end

private

  def self.imdb_title_eq(a, b)
    a = self.normalized_title(CGI.unescapeHTML(a))
    b = self.normalized_title(b)
    a.include?(b)
  end

  def self.imdb_year_eq(a, b)
    a && a[1].to_i == b
  end

end
