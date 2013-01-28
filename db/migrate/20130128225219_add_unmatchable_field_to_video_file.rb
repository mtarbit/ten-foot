class AddUnmatchableFieldToVideoFile < ActiveRecord::Migration
  def change
    add_column :video_files, :unmatchable, :boolean, default: false
  end
end
