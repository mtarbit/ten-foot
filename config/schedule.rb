# Learn more: http://github.com/javan/whenever

set :output, 'log/whenever.log'
set :environment, :development

every 1.hours do
  runner 'VideoFile.populate'
  runner 'Movie.populate'
  runner 'Series.populate'
end

every 30.minutes do
  runner 'Tweet.populate'
end
