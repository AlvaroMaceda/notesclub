# frozen_string_literal: true

class NoteUpdator < ApplicationService
  def initialize(note_id, args)
    @note_id = note_id
    @update_notes_with_links = args[:update_notes_with_links]
    @data = args[:data]
  end

  def call
    @note = Note.find(@note_id)
    @original_content = @note.content

    @data[:slug] = Note::ContentSlugGenerator.new(@data[:content]).generate if @data[:content].present? && @data[:ancestry].nil?
    Note.transaction do
      @note.update!(@data)
      create_new_notes_from_links!
      update_notes_with_links! if update_notes_with_links
    end
    Result.ok @note.reload.as_json
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.error("Error updating note #{@note.inspect}\nparams: #{@data.inspect}\n#{e.message}\n#{e.backtrace.join("\n")}")
    Result.error @note.errors.full_messages
  rescue ActiveRecord::RecordNotFound => e
    Rails.logger.error("Error updating note\nparams: #{@data.inspect}\n#{e.message}\n#{e.backtrace.join("\n")}")
    Result.error e.message
  end

  private
    attr_reader :update_notes_with_links, :original_content

    def create_new_notes_from_links!
      @note.content.split(/\[\[([^\[]*)\]\]/).each_with_index do |content, index|
        link_to_other_user = content.match(/^([^\s:]+):(.*)/)
        create_new_note!(content) if !link_to_other_user && link_to_note?(index) && !root_note_exists?(content)
      end
    end

    def update_notes_with_links!
      orig_cont = Regexp.escape(original_content)
      cont = @note.content
      Note.
        where.not(id: @note.id).
        where(user_id: @note.user_id).
        where("content like ?", "%[[#{orig_cont}]]%").find_each do |t|
        t.update!(content: t.content.gsub(/\[\[#{orig_cont}\]\]/, "[[#{cont}]]"))
      end
    end

    def create_new_note!(content)
      Note.create!(content: content, ancestry: nil, user_id: @note.user_id)
    end

    def root_note_exists?(content)
      slug = Note::ContentSlugGenerator.new(content).generate
      Note.where(slug: slug, ancestry: nil, user_id: @note.user_id).exists?
    end

    def link_to_note?(index)
      index % 2 == 1
    end
end
