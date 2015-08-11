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
        part: 'snippet',
        q: terms,
        type: 'video',
        maxResults: 24,
        safeSearch: 'none',
        videoEmbeddable: 'true'
      }
    )

    res.data.items
  end

  def self.video(video_id)
    res = self.client.execute!(
      api_method: self.api.videos.list,
      parameters: {
        part: 'snippet',
        id: video_id
      }
    )

    res.data.items.first
  end

  def self.videos(video_ids)
    res = self.client.execute!(
      api_method: self.api.videos.list,
      parameters: {
        part: 'snippet',
        id: video_ids.join(','),
        maxResults: 50
      }
    )

    res.data.items
  end

  def self.channel_for_user(username)
    res = self.client.execute!(
      api_method: self.api.channels.list,
      parameters: {
        part: 'snippet',
        forUsername: username
      }
    )

    res.data.items.first.id
  end

  def self.subscription_playlist_ids(channel_id)
    playlist_ids = []
    page_token = nil

    loop do
      data = self.subscriptions_page(channel_id, page_token)
      subs = data.items.map {|item| item.snippet.resourceId.channelId }
      playlist_ids.push(*self.upload_playlist_ids(subs))

      begin
        page_token = data.nextPageToken
      rescue NoMethodError
        break
      end
    end

    playlist_ids
  end

  def self.subscriptions_page(channel_id, page_token=nil)
    res = self.client.execute!(
      api_method: self.api.subscriptions.list,
      parameters: {
        part: 'snippet',
        channelId: channel_id,
        maxResults: 50,
        pageToken: page_token
      }
    )

    res.data
  end

  def self.upload_playlist_ids(channel_ids)
    res = self.client.execute!(
      api_method: self.api.channels.list,
      parameters: {
        part: 'contentDetails',
        id: channel_ids.join(','),
        maxResults: 50
      }
    )

    res.data.items.map {|item| item.contentDetails.relatedPlaylists.uploads }
  end

  def self.playlist_video_ids(playlist_id)
    res = self.client.execute!(
      api_method: self.api.playlist_items.list,
      parameters: {
        part: 'contentDetails',
        playlistId: playlist_id,
        maxResults: 5
      }
    )

    res.data.items.map {|item| item.contentDetails.videoId }
  end
end
