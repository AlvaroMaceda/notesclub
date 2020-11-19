# frozen_string_literal: true

require "rails_helper"

=begin
Create a new endpoint /notes/:id/related

It could receive (or not) the following parameters:

    include_descendants
    include_ancestors
    include_user

At the moment, related notes are those that:

    - have a backlink/reference to the passed note
    (e.g. where("content like %[[#{note.content}]]%") or where("content like %##{note.content}%"))

    - are a root note (ancestry: nil) and content is exactly note.content.
    For example, if the passed note is /hec/favourite_books, I want to see
    the notes with the same content from other users such as /alvaro/favourite_books.

Order:

    If there is an authenticated user (defined in method current_user), it should return the related notes from the authenticated user first.
    After the notes from the authenticated user, it should return the notes of the user of the passed note.

Also, it should not return the passed note (from the note.user) as a related note.
=end

def make_note(note_data)
  id = NoteCreator.call(note_data).value[:id]
  note_data.merge!(id: id).stringify_keys
end

RSpec.describe NoteRelatedFinder do
  fixtures(:users) #, :notes)
  let(:user1) { users(:user1) }
  let(:user2) { users(:user2) }
  # let(:note1) { notes(:note1) }
  # let(:note2) { notes(:note2) }
  # let(:note5) { notes(:note5) }

  before(:each) do
    unrelated_note1 = {
      content: "Unrelated note nº1",
      ancestry: nil,
      position: 1,
      slug: "unrelated_note_1",
      user_id: user1.id
    }
    NoteCreator.call unrelated_note1
    unrelated_note2 = {
      content: "Unrelated note nº 2, linking to [[Unrelated note nº1]], really linked to ##Unrelated note nº1",
      ancestry: nil,
      position: 1,
      slug: "unrelated_note_2",
      user_id: user1.id
    }
    NoteCreator.call unrelated_note2
  end

  it "returns error if called with a non-existing note" do
    non_existent_id = 999
    NoteDeleter.call(non_existent_id)

    result = NoteRelatedFinder.call(non_existent_id)

    expect(result.error?).to be true
    expect(result.errors).to match(/Couldn't find Note 999/)
  end

  describe "returns notes with a backlink to the note" do
    it "with [[...]] format" do
      note = {
        content: "Note to be linked",
        ancestry: nil,
        position: 1,
        slug: "note",
        user_id: user1.id
      }
      note_id = NoteCreator.call(note).value[:id]

      related_note_1 = make_note(
        content: "Note from the same user linking to the [[Note to be linked]]",
        ancestry: nil,
        position: 1,
        slug: "related_1",
        user_id: user1.id
      )
      related_note_2 = make_note(
        content: "Another note linking to the [[Note to be linked]] from another user",
        ancestry: nil,
        position: 1,
        slug: "related_2",
        user_id: user2.id
      )

      result = NoteRelatedFinder.call(note_id)

      expect(result.success?).to be true
      expect(notes_data(result.value)).to match_array([
        related_note_1,
        related_note_2
      ])
    end

    it "with ##... format" do
      skip
    end

    it "excludes the note passed as parameter" do
      skip
    end

    it "returns descendants" do
      skip
    end

    it "returns ancestors" do
      skip
    end

    it "returns user data" do
      skip
    end
  end

  describe "returns root notes with the same content" do
    skip
  end
end
