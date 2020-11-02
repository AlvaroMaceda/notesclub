# frozen_string_literal: true

class NoteDeleter < ApplicationService
  # TO-DO: receive a note id as parameter, not a Note
  def initialize(note)
    @note = note
  end

  def call
    Note.transaction do
      @note.destroy!
    end
    Result.ok
  rescue  ActiveRecord::RecordNotDestroyed
    Result.error
  end
end
