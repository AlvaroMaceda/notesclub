# frozen_string_literal: true

class NoteRelatedFinder < ApplicationService
  def initialize(note_id, connected_user_id: nil, include_ancestors: false, include_descendants: false, include_user: false)
    @note_id = note_id
  end

  def call
    @note = Note.find(@note_id)
    ## https://blog.bigbinary.com/2016/05/30/rails-5-adds-or-support-in-active-record.html
    # notes = Note.where("content like ?", "%[[#{note.content}]]%").or(
    #   Note.where("content like ?", "%#\##{note.content}%")
    # )

    notes = notes_which_link_using_brackets.or(
      notes_which_link_using_hash
    ).or(
      notes_with_same_content
    )
    # puts notes.to_sql

    Result.ok notes.as_json
  rescue ActiveRecord::RecordNotFound
    Result.error "Couldn't find Note #{@note_id}"
  end

  private
    def notes_which_link_using_brackets
      Note.where("content like ?", "%[[#{@note.content}]]%")
    end

    def notes_which_link_using_hash
      Note.where("content like ?", "%#\##{@note.content}%")
    end

    def notes_with_same_content
      Note.root_notes.
        where(content: @note.content).
        where.not(id: @note_id)
    end
end
