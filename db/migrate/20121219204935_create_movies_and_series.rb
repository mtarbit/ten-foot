class CreateMoviesAndSeries < ActiveRecord::Migration
  def change
    create_table :movies do |t|
      t.string  :imdb_id
      t.string  :title
      t.string  :image
      t.float   :rating
      t.string  :description
      t.string  :runtime
      t.string  :release_date

      t.timestamps
    end

    create_table :series do |t|
      t.string  :tvdb_id
      t.string  :title
      t.string  :image
      t.float   :rating
      t.string  :description

      t.timestamps
    end

    create_table :movies_video_files, id: false do |t|
      t.references :movie
      t.references :video_file
    end

    create_table :series_video_files, id: false do |t|
      t.references :series
      t.references :video_file
    end

    add_index :movies, :imdb_id
    add_index :movies, :title

    add_index :series, :tvdb_id
    add_index :series, :title

    add_index :series_video_files, [:series_id, :video_file_id]
    add_index :movies_video_files, [:movie_id, :video_file_id]
  end
end
