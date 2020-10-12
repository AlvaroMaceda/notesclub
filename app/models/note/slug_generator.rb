class Note::SlugGenerator
  BYTES_NUMBER = 15

  def initialize(note)
    @note = note
  end

  def generate_unique_slug
    if note.ancestry.nil?
      generate_unique_slug_from_content
    else
      generate_unique_random_slug
    end
  end

  private

  attr_reader :note

  def generate_unique_slug_from_content
    new_slug = generate_slug_from_content
    while another_note_with_slug?(new_slug)
      new_slug = "#{new_slug}#{SecureRandom.urlsafe_base64(1).downcase}"
    end
    new_slug
  end

  def generate_unique_random_slug
    new_slug = nil
    loop do
      new_slug = SecureRandom.urlsafe_base64(BYTES_NUMBER).downcase
      break unless another_note_with_slug?(new_slug)
    end
    new_slug
  end

  def another_note_with_slug?(new_slug)
    t = Note.where(slug: new_slug, user_id: note.user_id)
    t = t.where.not(id: note.id) if note.id
    t.exists?
  end

  def generate_slug_from_content
    Note::ContentSlugGenerator.new(note.content).generate
  end
end
