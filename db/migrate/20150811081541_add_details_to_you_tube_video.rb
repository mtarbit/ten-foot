class AddDetailsToYouTubeVideo < ActiveRecord::Migration
  def change
    add_column :you_tube_videos, :channel_title, :string
    add_column :you_tube_videos, :published_at, :datetime
  end
end
