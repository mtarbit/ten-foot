class TvdbService
  def self.api
    @@api ||= TvdbParty::Search.new($settings.tvdb_api_key)
  end

  def self.search(title, year = nil)
    results = api.search(title)

    results = results.sort do |a,b|
      a_score = 0
      b_score = 0

      a_score += 1 if self.tvdb_title_eq(a['SeriesName'], title)
      a_score += 1 if self.tvdb_title_in(a['SeriesName'], title)
      a_score += 1 if self.tvdb_year_eq(a['FirstAired'], year)
      a_score += 1 if self.tvdb_year_gt(a['FirstAired'], b['FirstAired'])

      b_score += 1 if self.tvdb_title_eq(b['SeriesName'], title)
      b_score += 1 if self.tvdb_title_in(b['SeriesName'], title)
      b_score += 1 if self.tvdb_year_eq(b['FirstAired'], year)
      b_score += 1 if self.tvdb_year_gt(b['FirstAired'], a['FirstAired'])

      b_score <=> a_score
    end

    results
  end

  def self.fetch(tvdb_id)
    api.get_series_by_id(tvdb_id)
  end

private

  def self.normalized_title(val)
    val && val.downcase.gsub(/[^\w\s]+/, '')
  end

  def self.normalized_year(val)
    if val.is_a?(Fixnum)
      val
    else
      val && val.split('-').first
    end
  end

  def self.tvdb_title_eq(a, b)
    a = self.normalized_title(a)
    b = self.normalized_title(b)
    a && b && (a == b || a.index(b) == 0)
  end

  def self.tvdb_title_in(a, b)
    a = self.normalized_title(a)
    b = self.normalized_title(b)
    a && b && a.include?(b)
  end

  def self.tvdb_year_eq(a, b)
    a = self.normalized_year(a)
    b = self.normalized_year(b)
    a && b && a == b
  end

  def self.tvdb_year_gt(a, b)
    a = self.normalized_year(a)
    b = self.normalized_year(b)
    (a && b && a > b) || (a && b.nil?)
  end
end
