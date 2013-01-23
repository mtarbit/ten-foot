require 'cgi'
require 'open-uri'

module ImageCacheable
  extend ActiveSupport::Concern

  included do
    after_save :cache_and_scale
  end

  CACHE_DIR = 'images/cached'

  URL_PATH = File.join('/', CACHE_DIR)
  ABS_PATH = File.join(Rails.public_path, CACHE_DIR)

  def cache_and_scale
    return unless image_changed?
    image_cached
    image_scaled(*DEFAULT_IMAGE_SIZE) if defined?(DEFAULT_IMAGE_SIZE)
  end

  def image_cached
    return unless image

    file_name = sanitized_filename
    file_path = File.join(ABS_PATH, file_name)

    unless File.exists?(file_path)
      begin
        data = open(image).read
        file = open(file_path, 'wb')
        file.write(data)
        file.close
      rescue OpenURI::HTTPError
        return
      end
    end

    File.join(URL_PATH, file_name)
  end

  def image_scaled(w = nil, h = nil)
    return unless image_cached
    return unless w || h

    src_name = sanitized_filename
    src_path = File.join(ABS_PATH, src_name)

    dim = ".#{w}x#{h}"
    ext = File.extname(src_name)

    dst_name = "#{File.basename(src_name, ext)}#{dim}#{ext}"
    dst_path = File.join(ABS_PATH, dst_name)

    unless File.exists?(dst_path)
      begin
        src = Magick::Image.read(src_path).first

        w ||= src.columns * (h.to_f / src.rows)
        h ||= src.rows * (w.to_f / src.columns)

        dst = src.resize_to_fit(w, h)
        dst.write(dst_path)
      rescue Magick::ImageMagickError
        return
      end
    end

    File.join(URL_PATH, dst_name)
  end

private

  def sanitized_filename
    image.gsub(/[^\w.]+/, '-')
  end

end
