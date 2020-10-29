class NoteCreator < ApplicationService

  def initialize(data)
    @data = data
  end

  # TO-DO: return the hash representation of the Note, not a Note object
  def call
    note = Note.new(@data)
    return Result.error note.errors.full_messages unless note.save
    Result.ok note
  end
end
