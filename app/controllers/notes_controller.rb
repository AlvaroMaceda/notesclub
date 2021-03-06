# frozen_string_literal: true

class NotesController < ApplicationController
  before_action :set_note, only: [:update, :destroy]
  before_action :authenticate_param_id!, only: [:update, :destroy]
  before_action :authenticate_param_user_id!, only: [:create]
  skip_before_action :authenticate_user!, only: [:index, :related, :count]

  def index
    result = NoteFinder.call(params)

    return render json: result.errors, status: :bad_request if result.error?
    render json: result.value, status: :ok
  end

  def count
    result = NoteCounter.call(params["url"])

    render json: result.errors, status: :bad_request if result.error?
    render json: result.value, status: :ok
  end

  def show
    params.permit("id", "slug", "include_descendants")
    params[:ids] = params.delete :id

    result = NoteFinder.call(params)

    return render json: result.errors, status: :bad_request if result.error?
    render json: result.value[0], status: :ok
  end

  def create
    args = params.require(:note).permit(:content, :ancestry, :position, :slug).merge(user_id: current_user.id, include_descendants: params[:include_descendants], include_ancestors: params[:include_ancestors])
    result = NoteCreator.call(args)
    if result.success?
      note = result.value
      track_action("Create note", note_id: note[:id])
      render json: note, status: :created
    else
      render json: result.errors, status: :bad_request
    end
  end

  def update
    result = NoteUpdator.call(
      params[:id],
      data: params.require(:note).permit(:content, :ancestry, :position, :slug),
      update_notes_with_links: params[:update_notes_with_links],
      descendants: params[:descendants],
      current_user: current_user
    )
    if result.success?
      track_action("Update note", note_id: params[:id])
      render json: result.value, status: :ok
    else
      render json: result.errors, status: :not_modified
    end
  end

  def destroy
    result = NoteDeleter.call(params[:id])
    if result.success?
      track_action("Delete note")
      render json: result.value, status: :ok
    else
      Rails.logger.error("Error deleting note #{params[:id]} - params: #{params.inspect}")
      render json: { errors: "Couldn't delete note or descendants" }, status: :not_modified
    end
  end

  def related
    result = NoteRelatedFinder.call(
      params[:id],
      authenticated_user_id: current_user&.id,
      include_ancestors: params[:include_ancestors],
      include_descendants: params[:include_descendants],
      include_user: params[:include_user]
    )

    # TO-DO: redesign Result, maybe returning exceptions and deleting the class?
    if result.error?
      if result.errors.match?(/Couldn't find Note/)
        return render json: {
          type: "/error/types/item_not_found",
          title: "Note not found",
          status: 404 # This MUST match response status
        }, status: :not_found
      else
        return render json: {
          type: "/error/types/bad_request",
          title: "Bad request",
          detail: result.errors,
          status: 400 # This MUST match response status
        }, status: :bad_request
      end
    end

    render json: result.value, status: :ok
  end

  private
    def track_note
      id = params["user_ids"].first
      blogger = User.find_by(id: id)
      if params["slug"]
        track_action("Get note", { blog_username: blogger.username, note_slug: params["slug"], blogger_id: blogger.id })
      else
        track_action("Get user notes", { blog_username: blogger.username, blogger_id: blogger.id })
      end
    end

    def set_note
      @note = Note.find(params[:id])
    end

    def authenticate_param_id!
      head :unauthorized if current_user.id != @note.user_id
    end

    def authenticate_param_user_id!
      head :unauthorized if !params[:note] || current_user.id.to_s != params[:note][:user_id].to_s
    end
end
