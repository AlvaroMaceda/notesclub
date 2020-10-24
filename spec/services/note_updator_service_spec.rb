# frozen_string_literal: true

require "rails_helper"

RSpec.describe NoteUpdatorService do
  fixtures(:users, :notes)

  let(:note) { notes(:note1) }

  it "should create new notes if they do not exist" do
    Note.create!(content: "This already exists", user_id: note.user_id)
    updator = NoteUpdatorService.new(note)
    expect { updator.update(content: "[[Books]] and [[Music]] and [[This already exists]]") }.to change { Note.count }.by(2)
    expect(note.reload.content).to eq("[[Books]] and [[Music]] and [[This already exists]]")
    t2, t1 = Note.order(id: :desc).limit(2)
    expect(t1.attributes.slice(*%w(ancestry content slug user_id))).to eq({
      "ancestry" => nil,
      "content" => "Books",
      "slug" => "books",
      "user_id" => note.user_id
    })
    expect(t2.attributes.slice(*%w(ancestry content slug user_id))).to eq({
      "ancestry" => nil,
      "content" => "Music",
      "slug" => "music",
      "user_id" => note.user_id
    })
  end

  context "when update_notes_with_links=true" do
    let(:user1) { users(:user1) }
    let(:user2) { users(:user2) }

    it "should update all notes from the user with links" do
      t1 = Note.create!(content: "Books", user: user1)
      t2 = Note.create!(content: "I like [[Books]] and [[Music]] and [[Books]]", user: user1)
      t3 = Note.create!(content: "Favourite [[Books]]", user: user1)
      t4 = Note.create!(content: "Great [[Books]]", user: user2)

      update_notes_with_links = true
      updator = NoteUpdatorService.new(t1, update_notes_with_links)
      expect(updator.update(content: "Books and articles")).to eq(true)
      expect(t1.reload.content).to eq("Books and articles")
      expect(t2.reload.content).to eq("I like [[Books and articles]] and [[Music]] and [[Books and articles]]")
      expect(t3.reload.content).to eq("Favourite [[Books and articles]]")
      # Should not modify t4 because user is different
      expect(t4.reload.content).to eq("Great [[Books]]")
    end
  end
end
