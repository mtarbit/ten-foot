Twitter.configure do |config|
  config.consumer_key = $settings.twitter.consumer_key
  config.consumer_secret = $settings.twitter.consumer_secret
  config.oauth_token = $settings.twitter.oauth_token
  config.oauth_token_secret = $settings.twitter.oauth_token_secret
end
