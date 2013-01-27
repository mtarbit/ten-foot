class AddProgressFieldToVideoFile < ActiveRecord::Migration
  def change
    add_column :video_files, :progress, :decimal
  end
end
