# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20130203094226) do

  create_table "movies", :force => true do |t|
    t.string   "imdb_id"
    t.string   "title"
    t.string   "image"
    t.float    "rating"
    t.string   "description"
    t.string   "runtime"
    t.string   "release_date"
    t.datetime "created_at",   :null => false
    t.datetime "updated_at",   :null => false
  end

  add_index "movies", ["imdb_id"], :name => "index_movies_on_imdb_id"
  add_index "movies", ["title"], :name => "index_movies_on_title"

  create_table "series", :force => true do |t|
    t.string   "tvdb_id"
    t.string   "title"
    t.string   "image"
    t.float    "rating"
    t.string   "description"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  add_index "series", ["title"], :name => "index_series_on_title"
  add_index "series", ["tvdb_id"], :name => "index_series_on_tvdb_id"

  create_table "tweets", :force => true do |t|
    t.string   "twitter_id"
    t.string   "user"
    t.string   "image"
    t.string   "text"
    t.datetime "date"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "tweets", ["twitter_id"], :name => "index_tweets_on_twitter_id"

  create_table "tweets_you_tube_videos", :id => false, :force => true do |t|
    t.integer "tweet_id"
    t.integer "you_tube_video_id"
  end

  add_index "tweets_you_tube_videos", ["tweet_id", "you_tube_video_id"], :name => "index_tweets_you_tube_videos_on_tweet_id_and_you_tube_video_id"

  create_table "video_files", :force => true do |t|
    t.string   "path"
    t.string   "extension"
    t.datetime "created_at",                     :null => false
    t.datetime "updated_at",                     :null => false
    t.string   "title"
    t.integer  "year"
    t.integer  "season"
    t.integer  "episode"
    t.integer  "media_id"
    t.string   "media_type"
    t.decimal  "progress"
    t.boolean  "unmatchable", :default => false
    t.boolean  "watched",     :default => false
  end

  add_index "video_files", ["media_id"], :name => "index_video_files_on_media_id"
  add_index "video_files", ["media_type"], :name => "index_video_files_on_media_type"

  create_table "you_tube_videos", :force => true do |t|
    t.string   "youtube_id"
    t.string   "image"
    t.string   "title"
    t.string   "description"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  add_index "you_tube_videos", ["youtube_id"], :name => "index_you_tube_videos_on_youtube_id"

end
