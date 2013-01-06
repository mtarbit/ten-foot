class CreateTweetsAndYouTubeVideos < ActiveRecord::Migration
  def change
    create_table :you_tube_videos do |t|
      t.string     :youtube_id
      t.string     :image
      t.string     :title
      t.string     :description
      t.timestamps
    end

    create_table :tweets do |t|
      t.string     :twitter_id
      t.string     :user
      t.string     :icon
      t.string     :text
      t.datetime   :date
      t.timestamps
    end

    create_table :tweets_you_tube_videos, id: false do |t|
      t.references :tweet
      t.references :you_tube_video
    end

    add_index :tweets, :twitter_id
    add_index :you_tube_videos, :youtube_id

    add_index :tweets_you_tube_videos, [:tweet_id, :you_tube_video_id]
  end
end
