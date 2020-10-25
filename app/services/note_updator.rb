# frozen_string_literal: true

class NoteUpdator < ApplicationService
  def initialize(note, update_notes_with_links = false)
    @note = note
    @update_notes_with_links = update_notes_with_links
    @original_content = note.content
  end

  def update(args)
    args[:slug] = Note::ContentSlugGenerator.new(args[:content]).generate if args[:content].present? && args[:ancestry].nil?
    Note.transaction do
      note.update!(args)
      create_new_notes_from_links!
      update_notes_with_links! if update_notes_with_links
    end
    true
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.error("Error updating note #{note.inspect}\nparams: #{args.inspect}\n#{e.message}\n#{e.backtrace.join("\n")}")
    false
  end

  private
    attr_reader :note, :update_notes_with_links, :original_content

    def create_new_notes_from_links!
      note.content.split(/\[\[([^\[]*)\]\]/).each_with_index do |content, index|
        link_to_other_user = content.match(/^([^\s:]+):(.*)/)
        create_new_note!(content) if !link_to_other_user && link_to_note?(index) && !root_note_exists?(content)
      end
    end

    def update_notes_with_links!
      orig_cont = Regexp.escape(original_content)
      cont = note.content
      Note.
        where.not(id: note.id).
        where(user_id: note.user_id).
        where("content like ?", "%[[#{orig_cont}]]%").find_each do |t|
        t.update!(content: t.content.gsub(/\[\[#{orig_cont}\]\]/, "[[#{cont}]]"))
      end
    end

    def create_new_note!(content)
      Note.create!(content: content, ancestry: nil, user_id: note.user_id)
    end

    def root_note_exists?(content)
      slug = Note::ContentSlugGenerator.new(content).generate
      Note.where(slug: slug, ancestry: nil, user_id: note.user_id).exists?
    end

    def link_to_note?(index)
      index % 2 == 1
    end
end
