class MediaController < ApplicationController
  def watched
    model = controller_name.classify.constantize
    media = model.find(params[:id])
    media.toggle_watched(params[:watched])

    respond_to do |format|
      format.html { redirect_to :back }
      format.js   { render nothing: true }
    end
  end

  def refresh
    Media.populate
    redirect_to :back
  end
end
