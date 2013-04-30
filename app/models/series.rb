class Series < Media
  validates_presence_of :tvdb_id
  validates_uniqueness_of :tvdb_id

  def self.search(title, year = nil)
    self.where('title LIKE ?', title).first
  end

  def self.search_tvdb(title, year = nil)
    result = TvdbService.search(title, year).first
    result && TvdbService.fetch(result['id'])
  end

  def self.create_from_tvdb(result)
    record = self.where(tvdb_id: result.id).first_or_initialize

    if record.new_record?
      record.title = result.name
      record.image = result.posters('en').first.url rescue nil
      record.rating = result.rating
      record.description = result.overview
      record.save!
    end

    record
  end

  def self.create_from_video_file(vf)
    record = self.search(vf.title, vf.year)

    unless record
      result = self.search_tvdb(vf.title, vf.year)
      record = result && self.create_from_tvdb(result)
    end

    if record
      record.video_files << vf
    end

    record
  end

  def self.populate
    VideoFile.unmatched.matchable_as_series.each do |vf|
      if self.create_from_video_file(vf)
        puts "Matched: #{vf}"
      else
        puts "No match for: #{vf}"
      end
    end
  end
end
