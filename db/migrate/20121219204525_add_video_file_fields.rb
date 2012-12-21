class AddVideoFileFields < ActiveRecord::Migration
  def change
    change_table :video_files do |t|
      t.string  :title
      t.integer :year
      t.integer :season
      t.integer :episode
    end
  end
end
