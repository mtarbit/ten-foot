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

ActiveRecord::Schema.define(:version => 20121223213243) do

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

  create_table "video_files", :force => true do |t|
    t.string   "path"
    t.string   "extension"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
    t.string   "title"
    t.integer  "year"
    t.integer  "season"
    t.integer  "episode"
    t.integer  "media_id"
    t.string   "media_type"
  end

  add_index "video_files", ["media_id"], :name => "index_video_files_on_media_id"
  add_index "video_files", ["media_type"], :name => "index_video_files_on_media_type"

end
