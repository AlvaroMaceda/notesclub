# frozen_string_literal: true

class NoteUpdator < ApplicationService
  def initialize(note_id, args)
    @note_id = note_id
    @update_notes_with_links = args[:update_notes_with_links]
    @data = args[:data]
    @descendants = args[:descendants]
    @current_user = args[:current_user]
  end

  def call
    @note = Note.find(@note_id)
    raise "note.user must be current_user" if current_user && @note.user_id != current_user.id

    @original_content = @note.content
    if Note.exists?(user_id: current_user.id, slug: @note["slug"])
      struct = OpenStruct.new(id: @note.id, slug: @data["slug"], content: @data["content"], user_id: current_user.id)
      @data["slug"] = Note::SlugGenerator.new(struct).generate_unique_slug if @note.slug != @data["slug"]
    end
    content_in_db_before = @note.content
    Note.transaction do
      @note.update!(@data)
      create_new_notes_from_links!
      update_descendants!(@note) if include_descendants?(@note)
      update_notes_with_links! if update_notes_with_links && @note.ancestry.nil? && content_in_db_before != @data["content"]
    end

    output = @note.reload.as_json.symbolize_keys
    output[:descendants] = descendants_with_tmp_keys if include_descendants?(@note)
    Result.ok output
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.error("Error updating note #{@note.inspect}\nparams: #{@data.inspect}\n#{e.message}\n#{e.backtrace.join("\n")}")
    Result.error @note.errors.full_messages
  rescue ActiveRecord::RecordNotFound => e
    Rails.logger.error("Error updating note\nparams: #{@data.inspect}\n#{e.message}\n#{e.backtrace.join("\n")}")
    Result.error e.message
  end

  private
    attr_reader :update_notes_with_links, :original_content, :descendants, :current_user

    # descendants' tmp_keys are provided as an input so the frontend can match the created records
    def descendants_with_tmp_keys
      @note.descendants.as_json.map do |descendant|
        descendant_id = descendant["id"]
        tmp_key = @tmp_keys_by_id[descendant_id]
        descendant["tmp_key"] = tmp_key if tmp_key.present?
        descendant
      end
    end

    def include_descendants?(note)
      descendants && note.ancestry.nil?
    end

    def update_descendants!(note)
      descendants_hash = descendants.inject({}) do |sum, descendant|
        sum[descendant["id"]] = descendant if descendant["id"]
        sum
      end
      descendant_ids = descendants_hash.keys
      deleted_ids = note.descendant_ids - descendant_ids
      Note.where(id: deleted_ids).destroy_all

      db_descendants_hash = note.descendants.inject({}) do |sum, descendant|
        sum[descendant.id] = descendant
        sum
      end

      @tmp_keys_by_id = {}
      DescendantsSorter.new(descendants).sort.each do |descendant|
        new_args = {
          content: descendant["content"],
          slug: descendant["slug"],
          ancestry: descendant["ancestry"] }
        new_args[:position] = descendant["position"] if descendant["position"].present?
        if descendant["id"].blank?
          new_note = Note.create!(new_args.merge(user_id: current_user.id))
          @tmp_keys_by_id[new_note.id] = descendant["tmp_key"]
        else
          descendant_id = descendant["id"].to_i
          db_descendant = db_descendants_hash[descendant_id]
          if changed?(db_descendant, descendant)
            db_descendant.update!(new_args)
          end
        end
      end
    end

    def changed?(db_descendant, descendant)
      %w(content ancestry slug position).any? do |at|
        db_descendant.send(at) != descendant[at]
      end
    end

    def create_new_notes_from_links!
      @note.content.split(/\[\[([^\[]*)\]\]/).each_with_index do |content, index|
        link_to_other_user = content.match(/^([^\s:]+):(.*)/)
        create_new_note!(content) if !link_to_other_user && link_to_note?(index) && !root_note_exists?(content)
      end
    end

    def update_notes_with_links!
      if original_content.present? && @note.content.present?
        orig_cont = Regexp.escape(original_content)
        cont = @note.content
        notes = Note.where.not(id: @note.id).where(user_id: @note.user_id)
        notes.where("content like ?", "%[[#{orig_cont}]]%").find_each do |t|
          t.update!(content: t.content.gsub(/\[\[#{orig_cont}\]\]/, "[[#{cont}]]"))
        end
        notes.where("content like ?", "%##{orig_cont}%").find_each do |t|
          t.update!(content: t.content.gsub("##{orig_cont}", cont.include?(" ") ? "#[[#{cont}]]" : "##{cont}"))
        end
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
