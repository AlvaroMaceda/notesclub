require 'rails_helper'

RSpec.describe NoteUpdator do
  fixtures(:users, :notes)

  let(:note) { notes(:note1) }

  it "should create new notes if they do not exist" do
    Note.create!(content: "This already exists", user_id: note.user_id)

    new_note_1_content = "New note 1"
    new_note_1_slug = Note::ContentSlugGenerator.new(new_note_1_content).generate
    new_note_2_content = "New note 2"
    new_note_2_slug = Note::ContentSlugGenerator.new(new_note_2_content).generate

    new_content = "[[#{new_note_1_content}]] and [[#{new_note_2_content}]] and [[This already exists]]"

    result = nil
    expect{ NoteUpdator.call(note, data: {content: new_content} ) }.to change{ Note.count }.by(2)
    expect(note.reload.content).to eq(new_content)
    
    new_note_1 = Note.find_by(slug: new_note_1_slug)
    expect(new_note_1.attributes.slice(*%w(ancestry content slug user_id))).to eq({
      "ancestry" => nil,
      "content" => new_note_1_content,
      "slug" => new_note_1_slug,
      "user_id" => note.user_id
    })

    new_note_2 = Note.find_by(slug: new_note_2_slug)
    expect(new_note_2.attributes.slice(*%w(ancestry content slug user_id))).to eq({
      "ancestry" => nil,
      "content" => new_note_2_content,
      "slug" => new_note_2_slug,
      "user_id" => note.user_id
    })
  end

  it 'returns an error when something fails' do
    result = NoteUpdator.call(note, data: {content: nil})
    expect(result.error?).to be true
  end

  context "when update_notes_with_links=true" do
    let(:user1) { users(:user1) }
    let(:user2) { users(:user2) }

    it "should update all notes from the user with links" do
      note1 = Note.create!(content: "Books", user: user1)
      note2 = Note.create!(content: "I like [[Books]] and [[Music]] and [[Books]]", user: user1)
      note3 = Note.create!(content: "Favourite [[Books]]", user: user1)
      note4 = Note.create!(content: "Great [[Books]]", user: user2)

      result = NoteUpdator.call(note1, update_notes_with_links: true, data: {content: "Books and articles"})

      expect(result.success?).to be true
      expect(note1.reload.content).to eq("Books and articles")
      expect(note2.reload.content).to eq("I like [[Books and articles]] and [[Music]] and [[Books and articles]]")
      expect(note3.reload.content).to eq("Favourite [[Books and articles]]")
      # Should not modify t4 because user is different
      expect(note4.reload.content).to eq("Great [[Books]]")
    end
  end
end
