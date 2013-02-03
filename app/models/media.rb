class Media < ActiveRecord::Base
  self.abstract_class = true

  include ImageCacheable

  has_many :video_files, as: :media, dependent: :nullify

  validates_presence_of :title

  DEFAULT_IMAGE_SIZE = [275, nil]

  def self.recent
    joins(:video_files).order('video_files.created_at DESC').group(self.arel_table[:id])
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

end
