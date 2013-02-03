class ImdbService
  def self.api
    @@api ||= ImdbParty::Imdb.new(anonymize: true)
  end

  def self.search(title, year = nil)
    results = api.find_by_title(title)

    results = results.sort do |a,b|
      a_score = 0
      b_score = 0

      a_score += 1 if self.imdb_title_eq(a[:title], title)
      a_score += 1 if self.imdb_year_eq(a[:year], year)

      b_score += 1 if self.imdb_title_eq(b[:title], title)
      b_score += 1 if self.imdb_year_eq(b[:year], year)

      b_score <=> a_score
    end if year

    results
  end

  def self.fetch(imdb_id)
    api.find_movie_by_id(imdb_id)
  end

private

  def self.normalized_title(title)
    title.downcase.gsub(/[^\w\s]+/, '')
  end

  def self.imdb_title_eq(a, b)
    a = self.normalized_title(CGI.unescapeHTML(a))
    b = self.normalized_title(b)
    a.include?(b)
  end

  def self.imdb_year_eq(a, b)
    a && a[1].to_i == b
  end
end
