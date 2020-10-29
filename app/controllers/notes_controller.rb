# frozen_string_literal: true

class NotesController < ApplicationController
  before_action :set_note, only: [:update, :destroy]
  before_action :authenticate_param_id!, only: [:update, :destroy]
  before_action :authenticate_param_user_id!, only: [:create]
  skip_before_action :authenticate_user!, only: [:index, :count]

  def index
    result = NoteFinder.call(params)
    
    render json: result.errors, status: :bad_request if result.error?
    render json: result.value, status: :ok
  end

  def count
    if params["url"].present?
      url = params["url"].downcase
      # We count all non-root notes (ancestry != nil):
      count1 = Note.
        where("lower(content) like ?", "%#{url}%").
        where("ancestry is not null").limit(10).count
      # We also count root notes with a first child where content is not empty:
      count2 = Note.
        joins("inner join notes as t on t.ancestry = cast(notes.id as VARCHAR(255)) and t.position=1 and t.content != ''").
        where("notes.ancestry is null").
        where("lower(notes.content) like ?", "%#{url}%").limit(10).count
      count = [count1 + count2, 10].min
    else
      count = 0
    end
    render json: count, status: :ok
  end

  def show
    params.permit("id", "slug", "include_descendants")
    params[:ids] = params.delete :id
  
    result = NoteFinder.call(params)

    render json: result.errors, status: :bad_request if result.error?
    render json: result.value[0], status: :ok
  end

  def create
    args = params.require(:note).permit(:content, :ancestry, :position, :slug).merge(user_id: current_user.id)
    result = NoteCreator.call(args)
    if result.success?
      note = result.value
      track_action("Create note", note_id: note.id)
      methods = []
      methods << :descendants if params[:include_descendants]
      methods << :ancestors if params[:include_ancestors]
      methods << :user if params[:include_user]
      render json: note.to_json(methods: methods), status: :created
    else
      render json: result.errors, status: :bad_request
    end
  end  

  def update
    result = NoteUpdator.call(@note, update_notes_with_links: params[:update_notes_with_links], data: params.require(:note).permit(:content, :ancestry, :position, :slug))
    if result.success?
      track_action("Update note", note_id: @note.id)
      render json: @note, status: :ok
    else
      render json: result.errors, status: :not_modified
    end
  end  

  def destroy
    if NoteDeleter.call(@note, include_descendants: true)
      track_action("Delete note")
      render json: @note, status: :ok
    else
      Rails.logger.error("Error deleting note #{@note.inspect} - params: #{params.inspect}")
      render json: { errors: "Couldn't delete note or descendants" }, status: :not_modified
    end
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
