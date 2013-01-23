class Series < ActiveRecord::Base
  include ImageCacheable

  has_many :video_files, as: :media, dependent: :nullify

  validates_presence_of :tvdb_id
  validates_presence_of :title
  validates_uniqueness_of :tvdb_id

  DEFAULT_IMAGE_SIZE = [275, nil]

  def self.tvdb
    @@tvdb ||= TvdbParty::Search.new($settings.tvdb_api_key)
  end

  def self.matches(title, year = nil)
    results = tvdb.search(title)

    results = results.sort do |a,b|
      a_score = 0
      b_score = 0

      a_score += 1 if self.tvdb_title_eq(a['SeriesName'], title)
      a_score += 1 if self.tvdb_year_eq(a['FirstAired'], year)

      b_score += 1 if self.tvdb_title_eq(b['SeriesName'], title)
      b_score += 1 if self.tvdb_year_eq(b['FirstAired'], year)

      b_score <=> a_score
    end if year

    results
  end

  def self.from_tvdb_id(tvdb_id)
    result = tvdb.get_series_by_id(tvdb_id)
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
        result = self.matches(vf.title, vf.year).first
        result && self.from_tvdb_id(result['id'])
      end

      if record
        record.video_files << vf
      else
        puts "No match for: #{vf.title} (#{vf.year})"
      end
    end
  end

private

  def self.normalized_title(title)
    title.downcase.gsub(/[^\w\s]+/, '')
  end

  def self.tvdb_title_eq(a, b)
    a = self.normalized_title(a)
    b = self.normalized_title(b)
    a.include?(b)
  end

  def self.tvdb_year_eq(a, b)
    a.split('-')[0] == b
  end

end
