class ConvertVideoFileAssociation < ActiveRecord::Migration
  def change
    change_table :video_files do |t|
      t.integer :media_id
      t.string  :media_type
    end

    add_index :video_files, :media_id
    add_index :video_files, :media_type

    execute <<-SQL
      UPDATE
        video_files
      SET
        media_type = 'Series',
        media_id =
          (SELECT series_id FROM series_video_files WHERE id = video_file_id)
      WHERE
        id IN
          (SELECT video_file_id FROM series_video_files);
    SQL

    execute <<-SQL
      UPDATE
        video_files
      SET
        media_type = 'Movie',
        media_id =
          (SELECT movie_id FROM movies_video_files WHERE id = video_file_id)
      WHERE
        id IN
          (SELECT video_file_id FROM movies_video_files);
    SQL
  end
end
