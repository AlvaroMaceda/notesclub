# frozen_string_literal: true

require "rails_helper"

def make_note(note_data)
  result = NoteCreator.call(note_data)
  # Don't get mad if we make an error with spec's data
  raise "Incorrect data for the note. Review your spec's call to make_note: #{result.errors}" unless result.success?
  id = result.value[:id]
  relevant_data note_data.merge!(id: id).stringify_keys
end

RELEVANT_FIELDS = [
  :id, :content, :slug, :user_id,
  :ancestry, :descendants
]
def relevant_data(notes)
  relevant_note_fields notes, RELEVANT_FIELDS
end

RSpec.describe NoteRelatedFinder do
  fixtures(:users)
  let(:user1) { users(:user1) }
  let(:user2) { users(:user2) }
  let(:user3) { users(:user3) }

  let(:note) { make_note(
    content: "Note to be linked",
    ancestry: nil,
    slug: "note",
    user_id: user1.id
  )}

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

  describe "returns notes with a link to the note" do
    it "with [[...]] format" do
      related_note_1 = make_note(
        content: "Note from the same user linking to the [[#{note["content"]}]]",
        ancestry: nil,
        slug: "related_1",
        user_id: user1.id
      )
      related_note_2 = make_note(
        content: "Another note linking to the [[#{note["content"]}]] from another user",
        ancestry: nil,
        slug: "related_2",
        user_id: user2.id
      )
      non_root_related_note = make_note(
        content: "One non-root note linking to [[#{note["content"]}]]",
        ancestry: related_note_1["id"].to_s,
        slug: "non_root_related_note",
        user_id: user1.id
      )

      result = NoteRelatedFinder.call(note["id"])

      expect(result.success?).to be true
      expect(relevant_data(result.value)).to match_array(relevant_data([
        related_note_1,
        related_note_2,
        non_root_related_note
      ]))
    end

    it "with ##... format" do
      related_note_1 = make_note(
        content: "Note from the same user linking to the ##" + note["content"],
        ancestry: nil,
        slug: "related_1",
        user_id: user1.id
      )
      related_note_2 = make_note(
        content: "Another note linking to the ##" + note["content"] + " from another user",
        ancestry: nil,
        slug: "related_2",
        user_id: user2.id
      )

      result = NoteRelatedFinder.call(note["id"])

      expect(result.success?).to be true
      expect(relevant_data(result.value)).to match_array(relevant_data([
        related_note_1,
        related_note_2
      ]))
    end

    it "returns empty array if there aren't related notes" do
      standalone_note = make_note(
        content: "This note doesn't have related notes",
        ancestry: nil,
        slug: "related_1",
        user_id: user1.id
      )

      result = NoteRelatedFinder.call(standalone_note["id"])

      expect(result.success?).to be true
      expect(result.value).to eq []
    end
  end

  describe "returns root notes with the same content" do
    it "include only root notes" do
      root_note_1 = make_note(
        content: note["content"],
        ancestry: nil,
        slug: "root_note_1",
        user_id: user1.id
      )
      root_note_2 = make_note(
        content: note["content"],
        ancestry: nil,
        slug: "root_note_2",
        user_id: user1.id
      )
      # non-root note
      make_note(
        content: note["content"],
        ancestry: root_note_2["id"],
        slug: "non_root_note",
        user_id: user1.id
      )

      result = NoteRelatedFinder.call(note["id"])

      expect(result.success?).to be true
      expect(relevant_data(result.value)).to match_array(relevant_data([
        root_note_1,
        root_note_2
      ]))
    end

    it "excludes the note passed as parameter" do
      result = NoteRelatedFinder.call(note["id"])

      expect(result.success?).to be true
      expect(result.value).to eq []
    end
  end

  describe "orders the results" do
    it "returning the notes of the note's user before the other notes" do
      note_user_id = note["user_id"]
      another_user_id = user3.id

      # rubocop:disable Lint/UselessAssignment
      another_user_note = make_note(
        content: "Note linking to the [[#{note["content"]}]]",
        ancestry: nil,
        slug: "related_1",
        user_id: another_user_id
      )
      user_note_1 = make_note(
        content: note["content"],
        ancestry: nil,
        slug: "user_note_1",
        user_id: note_user_id
      )
      # rubocop:enable Lint/UselessAssignment

      result = NoteRelatedFinder.call(note["id"])

      expect(result.success?).to be true

      notes = result.value
      expect(notes.count).to eq 2
      expect(notes[0]["user_id"]).to eq note_user_id
      expect(notes[1]["user_id"]).to eq another_user_id
    end

    it "returning first the authenticated user's notes, then note's user's notes", focus: true do
      auth_user = user2
      note_user = user1
      another_user = user3

      # rubocop:disable Lint/UselessAssignment
      auth_user_note_1 = make_note(
        content: note["content"],
        ancestry: nil,
        slug: "auth_user_note_1",
        user_id: auth_user.id
      )
      auth_user_note_2 = make_note(
        content: "Note linking to the [[#{note["content"]}]]",
        ancestry: nil,
        slug: "auth_user_note_2",
        user_id: auth_user.id
      )
      user_note_1 = make_note(
        content: note["content"],
        ancestry: nil,
        slug: "user_note_1",
        user_id: note_user.id
      )
      user_note_2 = make_note(
        content: "Note linking to the [[#{note["content"]}]]",
        ancestry: nil,
        slug: "user_note_2",
        user_id: note_user.id
      )
      another_user_note = make_note(
        content: "Note linking to the [[#{note["content"]}]]",
        ancestry: nil,
        slug: "another_user_note",
        user_id: another_user.id
      )
      # rubocop:enable Lint/UselessAssignment

      result = NoteRelatedFinder.call(note["id"], authenticated_user_id: auth_user.id)

      expect(result.success?).to be true

      notes = result.value
      expect(notes.count).to eq 5
      expect(notes[0]["user_id"]).to eq auth_user.id
      expect(notes[1]["user_id"]).to eq auth_user.id
      expect(notes[2]["user_id"]).to eq note_user.id
      expect(notes[3]["user_id"]).to eq note_user.id
      expect(notes[4]["user_id"]).to eq another_user.id
    end
  end

  xit "includes descendants, ancestors and user data" do
  end
end
