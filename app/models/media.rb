class Media < ActiveRecord::Base
  self.abstract_class = true

  include ImageCacheable

  has_many :video_files, as: :media, dependent: :nullify

  validates_presence_of :title

  DEFAULT_IMAGE_SIZE = [275, nil]

  def self.recent
    joins(:video_files).select("#{self.arel_table.name}.*, MAX(video_files.updated_at) AS max_updated_at").order('max_updated_at DESC').group(self.arel_table[:id])
  end

  def self.watched(flag = true)
    joins(:video_files).where(video_files: {watched: flag}).group(self.arel_table[:id])
  end

  def self.unwatched
    watched(false)
  end

  def toggle_watched(watched = nil)
    watched ||= video_files.any?(&:unwatched?)
    video_files.each do |record|
      record.watched = watched
      record.save!
    end
  end

  def watched?
    !unwatched?
  end

  def unwatched?
    video_files.unwatched.exists?
  end

  def self.populate
    VideoFile.populate
    Movie.populate
    Series.populate
    VideoFile.unmatched.update_all(unmatchable: true)
  end

end
