class Series < ActiveRecord::Base
  include ImageCacheable

  has_and_belongs_to_many :video_files

  validates_presence_of :tvdb_id
  validates_presence_of :title
  validates_uniqueness_of :tvdb_id
end
