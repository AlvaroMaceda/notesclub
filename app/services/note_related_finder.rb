# frozen_string_literal: true

class NoteRelatedFinder < ApplicationService
  def initialize(note_id, include_ancestors: false, include_descendants: false, include_user: false)
    @note_id = note_id
  end

  def call
    note = Note.find(@note_id)
    ## https://blog.bigbinary.com/2016/05/30/rails-5-adds-or-support-in-active-record.html
    notes = Note.where("content like '%[[#{note.content}]]%'")
    Result.ok notes.as_json
  rescue ActiveRecord::RecordNotFound
    Result.error "Couldn't find Note #{@note_id}"
  end
end
