class CreateVideoFiles < ActiveRecord::Migration
  def up
    create_table :video_files do |t|
      t.string :path
      t.string :extension
      t.timestamps
    end
  end

  def down
    drop_table :video_files
  end
end
