class RenameTweetIconFieldToImage < ActiveRecord::Migration
  def up
    rename_column :tweets, :icon, :image
  end

  def down
    rename_column :tweets, :image, :icon
  end
end
