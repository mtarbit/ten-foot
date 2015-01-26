class YouTubeService
  def self.client
    @@client ||= Google::APIClient.new(
      key: $settings.google.developer_key,
      authorization: nil,
      application_name: 'Ten Foot',
      application_version: '1.0.0'
    )
  end

  def self.api
    @@api ||= self.client.discovered_api('youtube', 'v3')
  end

  def self.search(terms)
    res = self.client.execute!(
      api_method: self.api.search.list,
      parameters: {
        q: terms,
        type: 'video',
        part: 'snippet',
        maxResults: 24,
        safeSearch: 'none',
        videoEmbeddable: 'true'
      }
    )

    res.data.items
  end
end
