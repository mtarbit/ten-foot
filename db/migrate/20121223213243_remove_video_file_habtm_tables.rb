class RemoveVideoFileHabtmTables < ActiveRecord::Migration
  def up
    drop_table :movies_video_files
    drop_table :series_video_files
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
