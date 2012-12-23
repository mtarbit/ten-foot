class Series < ActiveRecord::Base
  include ImageCacheable

  has_many :video_files, as: :media

  validates_presence_of :tvdb_id
  validates_presence_of :title
  validates_uniqueness_of :tvdb_id

  def self.populate
    tvdb = TvdbParty::Search.new($settings.tvdb_api_key)

    VideoFile.unmatched.matchable_as_series.each do |vf|
      series = self.where('title LIKE ?', vf.title).first

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

        series = self.where(tvdb_id: tvdb_series.id).first_or_initialize
        if series.new_record?
          series.title = tvdb_series.name
          series.image = tvdb_series.posters('en').first.url rescue nil
          series.rating = tvdb_series.rating
          series.description = tvdb_series.overview
          series.save!
        end
      end

      series.video_files << vf
    end
  end
end
