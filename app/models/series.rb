class Series < ActiveRecord::Base
  include ImageCacheable

  has_many :video_files, as: :media

  validates_presence_of :tvdb_id
  validates_presence_of :title
  validates_uniqueness_of :tvdb_id
end
