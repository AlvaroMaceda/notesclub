# frozen_string_literal: false

class NoteRelatedFinder < ApplicationService
  def initialize(note_id, authenticated_user_id: nil, include_ancestors: false, include_descendants: false, include_user: false)
    @note_id = note_id
    @authenticated_user_id = authenticated_user_id

    @methods = []
    @methods << :descendants if include_descendants
    @methods << :ancestors if include_ancestors
    @methods << :user if include_user
  end

  def call
    notes = find_and_order_notes
    Result.ok notes.as_json(methods: @methods)
  rescue ActiveRecord::RecordNotFound
    Result.error "Couldn't find Note #{@note_id}"
  end

  private
    def note
      @note ||= Note.find(@note_id)
    end

    def find_and_order_notes
      return [] if note.content.blank?

      notes_which_link_using_brackets.or(
      notes_which_link_using_hash
      ).or(
        notes_with_same_content
      ).order(
        ordering_clause
      )
    end

    def notes_which_link_using_brackets
      Note.where("content ilike ?", "%[[#{note.content}]]%")
    end

    def notes_which_link_using_hash
      Note.where("content ilike ?", "%\##{note.content}%")
    end

    def notes_with_same_content
      Note.root_notes.
        where("lower(content) = ?", @note.content.downcase).
        where.not(id: @note_id)
    end

    TOP_POSITION = 1
    SECOND_POSITION = 2
    BOTTOM_POSITION = 999
    def ordering_clause
      order_clause = "CASE user_id "
      order_clause << ActiveRecord::Base.sanitize_sql(["WHEN ? THEN ? ", @authenticated_user_id, TOP_POSITION]) if @authenticated_user_id
      order_clause << ActiveRecord::Base.sanitize_sql(["WHEN ? THEN ? ", note.user_id, SECOND_POSITION])
      order_clause << ActiveRecord::Base.sanitize_sql(["ELSE ? ", BOTTOM_POSITION ])
      order_clause << "END"
      Arel.sql(order_clause)
    end
end
