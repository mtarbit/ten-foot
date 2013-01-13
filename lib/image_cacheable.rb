require 'cgi'
require 'open-uri'

module ImageCacheable
  def image_cached
    return unless image

    file_name = image.gsub(/[^\w.]+/, '-')

    rel_path = File.join('images/cached', file_name)
    abs_path = File.join(Rails.public_path, rel_path)

    unless File.exists?(abs_path)
      begin
        open(abs_path, 'wb') do |file|
          file << open(image).read
        end
      rescue OpenURI::HTTPError
        return
      end
    end

    File.join('/', rel_path)

  end
end
