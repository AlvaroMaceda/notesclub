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
    raise "note.user must be current_user" if @note.user_id != current_user.id

    @original_content = @note.content
    Note.transaction do
      @note.update!(@data)
      create_new_notes_from_links!
      update_descendants!(@note) if include_descendants?(@note)
      update_notes_with_links! if update_notes_with_links
    end
    methods = []
    methods << :descendants if include_descendants?(@note)

    DESCENDANTS SHOULD RETURN TMP_KEY

    Result.ok @note.reload.as_json(methods: methods).symbolize_keys
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.error("Error updating note #{@note.inspect}\nparams: #{@data.inspect}\n#{e.message}\n#{e.backtrace.join("\n")}")
    Result.error @note.errors.full_messages
  rescue ActiveRecord::RecordNotFound => e
    Rails.logger.error("Error updating note\nparams: #{@data.inspect}\n#{e.message}\n#{e.backtrace.join("\n")}")
    Result.error e.message
  end

  private
    attr_reader :update_notes_with_links, :original_content, :descendants, :current_user

    def include_descendants?(note)
      descendants && note.ancestry.nil?
    end

    def update_descendants!(note)
      # note.descendants.destroy_all
      # descendants.each do |descendant|
      #   args = {
      #     ancestry: descendant["ancestry"],
      #     position: descendant["position"],
      #     content: descendant["content"]
      #   }
      #   n = Note.new(args.merge(user_id: current_user.id))
      #   n.id = descendant["id"] if descendant["id"].present?
      #   n.created_at = descendant["created_at"] if descendant["created_at"].present?
      #   n.save!
      # end

      descendants_hash = descendants.inject({}) do |sum, descendant|
        sum[descendant["id"]] = descendant if descendant["id"]
        sum
      end
      descendant_ids = descendants_hash.keys
      deleted_ids = note.descendant_ids - descendant_ids
      Note.where(id: deleted_ids).destroy_all

      # descendants_hash

      db_descendants = note.descendants

      db_descendants_hash = db_descendants.inject({}) do |sum, descendant|
        sum[descendant.id] = descendant
        sum
      end

      DescendantsSorter.new(descendants).sort.each do |descendant|
        new_args = {
          content: descendant["content"],
          slug: descendant["slug"],
          ancestry: descendant["ancestry"] }
        new_args[:position] = descendant["positon"] if descendant["position"].present?
        if descendant["id"].blank?
          Note.create!(new_args.merge(user_id: current_user.id))
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
