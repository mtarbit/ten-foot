class Movie < ActiveRecord::Base
  include ImageCacheable

  has_many :video_files, as: :media

  validates_presence_of :imdb_id
  validates_presence_of :title
  validates_uniqueness_of :imdb_id

  def year
    release_date && release_date.split('-').first
  end
end
