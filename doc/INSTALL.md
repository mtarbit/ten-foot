## Using an external HDD

If you're using an external hard drive and it's auto-mounted, you may need to explicitly create a custom mount point for it instead to allow you to set the necessary permissions so that your media can be served to the client.

    $ sudo vim /etc/fstab

An example fstab entry is as follows:

    LABEL="ExternalHDD"  /mnt/ExternalHDD  ntfs-3g    defaults,auto,uid=1000,gid=1000,umask=022  0  0

After adding something like this and restarting, your HDD should appear at the specified path with group & world readable permissions.

## Installing dependencies

Some initial dependencies for the software that follows:

    sudo apt-get -y install apache2 sqlite3 libsqlite3-dev libreadline-dev zlib imagemagick libmagickwand-dev browser-plugin-vlc postgresql

Install rbenv to manage Ruby versions as described here: https://github.com/sstephenson/rbenv

Install ruby-build to install Ruby versions as described here: https://github.com/sstephenson/ruby-build

Install the current version of Ruby:

    $ rbenv install 2.3.3

Install bundler to manage Ruby gem dependencies:

    $ gem install bundler
    $ rbenv rehash

Install the Ruby gems themselves:

    $ bundle install
    $ rbenv rehash

Create and configure the postgres database:

    $ sudo -u postgres createuser -PSRd tenfoot
    # Enter the password 'tenfoot' when prompted
    $ sudo -u postgres createdb tenfoot --owner=tenfoot
    $ sudo vim /etc/postgresql/9.1/main/pg_hba.conf
    # Edit line 90-ish from 'local all all peer' to 'local all all md5'
    $ sudo /etc/init.d/postgresql restart


## Installing the application

Fetch a copy of the ten foot source:

    $ mkdir ~/projects; cd !$
    $ git clone git@github.com:mtarbit/ten-foot.git

Configure the application:

    $ cp config/settings.yml.example config/settings.yml

Create a symlink to your media:

    $ ln -s /path/to/my/videos public/videos

Sign up for a TVDB API key here: http://thetvdb.com/?tab=apiregister

Sign up for Twitter API details here: https://dev.twitter.com/apps

Edit config/settings.yml and add your settings.

Populate the database:

    $ rake db:setup
    $ rake tenfoot:populate

Add a scheduled job to check for new data once an hour:

    $ whenever --update-crontab

Start the app:

    $ ./script/run
