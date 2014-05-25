class VideoFile < ActiveRecord::Base
  belongs_to :media, polymorphic: true

  attr_accessible :path

  before_validation :attributes_from_path
  before_save :update_watched

  validates_presence_of :path
  validates_presence_of :extension
  validates_uniqueness_of :path

  EXTENSIONS     = %w[avi wmv mpg mp4 m4v mkv ogv ts]
  EXTENSIONS_VLC = %w[avi wmv mp4 mkv ts]

  EXTENSIONS_RE_STR = '\.(' + EXTENSIONS.join('|') + ')$'
  EXTENSIONS_RE = Regexp.new(EXTENSIONS_RE_STR, Regexp::IGNORECASE)

  WATCHED_PROGRESS_RATIO = 0.90

  scope :watched, where(watched: true)
  scope :unwatched, where(watched: false)

  scope :matched, where('media_id IS NOT NULL')
  scope :unmatched, where(media_id: nil)

  scope :matchable, where(unmatchable: false)
  scope :unmatchable, where(unmatchable: true)

  scope :movies, where(season: nil, episode: nil)
  scope :series, where('season IS NOT NULL OR episode IS NOT NULL')

  def self.first_watchable
    unwatched.first || first
  end

  def toggle_watched(watched = nil)
    self.watched = watched || unwatched?
    save!
  end

  def unwatched?
    !watched?
  end

  def use_vlc?
    EXTENSIONS_VLC.include?(extension)
  end

  def url
    bits = path.split(File::SEPARATOR)
    bits = bits.map {|b| URI.escape(b) }
    '/videos/' + bits.join('/')
  end

  def full_path
    File.join($settings.video_files_path, path)
  end

  def attributes_from_path
    return unless path

    ext = File.extname(path)
    unless ext.empty?
      self.extension = ext.downcase[1..-1]
    end

    parsed = parse_path

    self.title     = parsed[:title]
    self.year      = parsed[:year]
    self.season    = parsed[:season]
    self.episode   = parsed[:episode]
  end

  def parse_path
    s = path.dup
    h = {title:nil, year:nil, season:nil, episode:nil}

    # Remove file extensions
    s.gsub!(EXTENSIONS_RE, '')
    # Remove punctuation (but not brackets or path separators)
    s.gsub!(/[^a-zA-Z0-9'\[\](){}\/]+/, ' ')

    # Extract any season or episode info
    unless h[:season] && h[:episode]
      patterns = [
        /\b(?:s|sn|sea|season) ?(\d+) ?(?:e|ep|episode) ?(\d+)\b/i,
        /\b(\d{1,2}) ?x ?(\d{1,2})\b/i,
        /\b([1-9])0([1-9])\b/i
      ]

      patterns.each do |pattern|
        match = s.match(pattern)
        if match
          h[:season] = match[1].to_i
          h[:episode] = match[2].to_i
          break
        end
      end

      unless h[:season]
        match = s.match(/\b(?:s|sn|sea|season) ?(\d+)\b/i)
        h[:season] = match[1].to_i if match
      end

      unless h[:episode]
        match = s.match(/\b(?:e|ep|episode) ?(\d+)\b/i)
        h[:episode] = match[1].to_i if match
      end
      unless h[:episode]
        match = s.match(/\b0(\d+)\b/i)
        h[:episode] = match[1].to_i if match
      end
      unless h[:episode]
        match = s.match(/\b(\d+) ?of ?\d+\b/i)
        h[:episode] = match[1].to_i if match
      end
    end

    # Extract any bracketed year info
    s.scan(/\[[^\]]+\]|\{[^}]+\}|\([^)]+\)/) do |brackets|
      match = brackets.match(/\b((?:19|20)\d{2})\b/)
      if match
        h[:year] = match[1]
      end
    end

    # If we already found a bracketed year, then any other
    # years we find will probably be part of the title.
    unless h[:year]
      # Otherwise remove year and anything following it
      match = s.match(/\b((?:19|20)\d{2})\b/)
      if match
        h[:year] = match[1]
        s.gsub!(/\b(?:19|20)\d{2}\b.*/, '')
      end
    end

    # Remove bracketed parts at the start of the line
    s.gsub!(/^\[[^\]]+\]/, ' ')
    s.gsub!(/^\{[^}]+\}/, ' ')
    s.gsub!(/^\([^)]+\)/, ' ')

    # Remove remaining bracketed parts and everything following
    s.gsub!(/\[[^\]]+\].*/, ' ')
    s.gsub!(/\{[^}]+\}.*/, ' ')
    s.gsub!(/\([^)]+\).*/, ' ')

    # Remove season, episode, and anything following it
    s.gsub!(/\b(the )?(complete )?seasons?( ?(\d+|one|two|three|four))+( complete)?\b.*/i, '')
    s.gsub!(/\bsn?\d+ ?(ep?\d+)?\b.*/i, '')
    s.gsub!(/\b\d+ ?(of|x) ?\d+\b.*/i, '')
    s.gsub!(/\b\d0\d\b.*/, '')
    s.gsub!(/\b(part|pt)s( ?\d+)+\b.*/i, '')

    # Remove general meta info
    s.gsub!(/\b(ppvrip|bdrip|brrip|dvd ?rip|hdrip|hdtv|hd|dvdscr|scr|divx|xvid|xvidhd|aac\d?|ac[23]|x264|h264|(480|720|1080)p|1080i|sample|torrent|(cd|disc) ?\d|criterion|\d+(fps|kbps)|subs|subtitles)\b.*/i, ' ')
    # Remove qualifiers
    s.gsub!(/\b(collection|trilogy|quadrilogy|extended|unrated|uncut|(the )?director'?s cut|special edition|documentary)\b/i, ' ')
    # Remove l33tness (unless the path is all uppercase)
    s.gsub!(/\b([A-Z]\w*){3,}\b/, '') if s =~ /[a-z]/
    # Remove left-over l33tness in title and lower case
    s.gsub!(/\b(Jaybob|Gopo|Cat Nap|2HD|2hd|2ch|fqm|lol|amiable|Thizz|sparks|V5|aXXo|vip3r)\b/, ' ')

    # Strip empty space and path separators from both ends
    s.gsub!(/^[\s\/]+/, '')
    s.gsub!(/[\s\/]+$/, '')

    # Use the first remaining path component as the title
    s = s.split('/').first || ''

    # Lowercase and compress multiple spaces
    s = s.downcase.gsub(/ +/, ' ').strip

    h[:title] = s

    h
  end

  def to_s
    s = []
    s << "season: #{season}" if season
    s << "episode: #{episode}" if episode
    s << "year: #{year}" if year
    s = (s.count > 0) ? " (#{s.join(', ')})" : ''
    "#{title}#{s}"
  end

  def self.populate
    Dir.chdir($settings.video_files_path)

    source_paths = Dir.glob('**/*.{' + EXTENSIONS.join(',') + '}')
    stored_paths = VideoFile.pluck(:path)

    create_paths = source_paths - stored_paths
    delete_paths = stored_paths - source_paths

    # Create records for any paths we haven't come across before.
    create_paths.each do |path|
      full_path = File.join($settings.video_files_path, path)
      next if File.directory?(full_path)

      self.create(path: path, created_at: File.ctime(full_path))

      puts "Found new video: #{path}"
    end

    # Delete records for any paths that aren't there any more.
    VideoFile.where(path: delete_paths).destroy_all
  end

protected

  def update_watched
    if self.progress && self.progress > WATCHED_PROGRESS_RATIO
      self.watched = true
    end
  end
end
