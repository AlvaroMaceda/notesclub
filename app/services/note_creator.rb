class NoteCreator < ApplicationService

  def initialize(data)
    @data = data
  end

  def call
    note = Note.new(@data)
    return Result.error note.errors.full_messages unless note.save
    Result.ok note
  end
end
