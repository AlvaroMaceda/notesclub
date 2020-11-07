# frozen_string_literal: true

class NoteDeleter < ApplicationService
  def initialize(note_id)
    @note_id = note_id
  end

  def call
    @note = Note.find(@note_id)
    Note.transaction do
      @note.destroy!
    end
    Result.ok @note.as_json
  rescue ActiveRecord::RecordNotFound
    Result.error "Couldn't find Note #{@note_id}"
  rescue  ActiveRecord::RecordNotDestroyed => e
    Result.error e.message
  end
end
