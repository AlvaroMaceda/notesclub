class NoteCounter < ApplicationService

  MAX_COUNT = 10

  def initialize(url = nil)
    @url = url
  end

  def call
    return Result.ok 0 unless @url.present?

    url = @url.downcase
    count = non_root_notes(url) + non_empty_root_notes(url)

    Result.ok [count,MAX_COUNT].min
  end

  private

  def non_root_notes(url)
    Note.
      where("lower(content) like ?", "%#{url}%").
      where("ancestry is not null").limit(10).count
  end

  def non_empty_root_notes(url)
    Note.
      joins("inner join notes as t on t.ancestry = cast(notes.id as VARCHAR(255)) and t.position=1 and t.content != ''").
      where("notes.ancestry is null").
      where("lower(notes.content) like ?", "%#{url}%").limit(10).count
  end

end
