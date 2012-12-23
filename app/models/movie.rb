class Movie < ActiveRecord::Base
  include ImageCacheable

  has_many :video_files, as: :media

  validates_presence_of :imdb_id
  validates_presence_of :title
  validates_uniqueness_of :imdb_id

  def year
    release_date && release_date.split('-').first
  end

  def self.populate
    imdb = ImdbParty::Imdb.new(anonymize: true)

    VideoFile.unmatched.matchable_as_movies.each do |vf|
      movie = self.where('title LIKE ?', vf.title).first

      unless movie
        results = imdb.find_by_title(vf.title)
        next if results.empty?
        results = results.sort do |a,b|
          a_score = 0
          b_score = 0

          a_score += 1 if a[:title].downcase == vf.title
          a_score += 1 if a[:year] == vf.year

          b_score += 1 if b[:title].downcase == vf.title
          b_score += 1 if b[:year] == vf.year

          b_score <=> a_score
        end if vf.year

        imdb_movie = imdb.find_movie_by_id(results.first[:imdb_id])

        movie = self.where(imdb_id: imdb_movie.imdb_id).first_or_initialize
        if movie.new_record?
          movie.title = imdb_movie.title
          movie.image = imdb_movie.poster_url
          movie.rating = imdb_movie.rating
          movie.description = imdb_movie.plot
          movie.runtime = imdb_movie.runtime
          movie.release_date = imdb_movie.release_date
          movie.save!
        end
      end

      movie.video_files << vf
    end
  end
end
