namespace :tenfoot do

  desc "Populate database with data from videos, APIs and feeds."
  task :populate => :environment do
    Media.populate
    YouTubeVideo.populate
    Tweet.populate
  end

  desc "Generate an example apache config appropriate for your settings."
  task :apacheconf => :environment do
    passenger_path = `bundle show passenger`.chomp
    ruby_path = `rbenv which ruby`.chomp

    puts <<-END.strip_heredoc
      Listen 8080

      LoadModule passenger_module #{passenger_path}/ext/apache2/mod_passenger.so
      PassengerRoot #{passenger_path}
      PassengerRuby #{ruby_path}

      <VirtualHost *:8080>

          DocumentRoot #{Rails.public_path}

          ErrorLog ${APACHE_LOG_DIR}/ten-foot.error.log
          CustomLog ${APACHE_LOG_DIR}/ten-foot.access.log combined

          RailsEnv #{Rails.env}

          <Directory #{Rails.root}>
              Options -Indexes -MultiViews FollowSymlinks
              AllowOverride All
          </Directory>

          Alias /videos #{$settings.video_files_path}
          <Directory #{$settings.video_files_path}>
              PassengerEnabled off
              Options Indexes MultiViews FollowSymLinks
              AllowOverride None
          </Directory>

      </VirtualHost>
    END
  end

end
