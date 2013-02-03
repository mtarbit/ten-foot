class Series < Media
  validates_presence_of :tvdb_id
  validates_uniqueness_of :tvdb_id

  def self.from_tvdb_result(result)
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

  def self.populate
    VideoFile.unmatched.matchable_as_series.each do |vf|
      record = self.where('title LIKE ?', vf.title).first

      record ||= begin
        result = TvdbService.search(vf.title, vf.year).first
        result && self.from_tvdb_result(TvdbService.fetch(result['id']))
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
