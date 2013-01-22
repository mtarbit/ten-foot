namespace :tenfoot do

  desc "Populate database with data from videos, APIs and feeds."
  task :populate => :environment do
    VideoFile.populate
    Movie.populate
    Series.populate
    Tweet.populate
  end

end
