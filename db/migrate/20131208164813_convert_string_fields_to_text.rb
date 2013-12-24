class ConvertStringFieldsToText < ActiveRecord::Migration
  def change
    change_column :movies, :description, :text
    change_column :series, :description, :text
    change_column :you_tube_videos, :description, :text
  end
end
