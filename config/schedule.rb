# Learn more: http://github.com/javan/whenever

set :output, 'log/whenever.log'
set :environment, :development

every 1.hours do
  rake 'tenfoot:populate'
end
