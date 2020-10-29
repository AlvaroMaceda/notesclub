class NoteDeleter < ApplicationService

  # TO-DO: receive a note id as parameter, not a Note
  def initialize(note, args = {})
    @note = note
    @include_descendants = args[:include_descendants] || true
  end

  def call
    Note.transaction do
      delete_descendants if include_descendants
      note.destroy!
    end
    Result.ok
  rescue  ActiveRecord::RecordNotDestroyed => e
    Result.error
  end

  private

  attr_reader :note, :include_descendants

  # We use delete_all instead of each{|t| t.destroy!} because at the moment:
  # - we don't have before_* or after_destroy methods
  # - we do not have associations dependant on this
  def delete_descendants
    note.descendants.delete_all
  end
end
