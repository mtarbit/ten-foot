class AddWatchedFieldToVideoFile < ActiveRecord::Migration
  def change
    add_column :video_files, :watched, :boolean, default: false
  end
end
