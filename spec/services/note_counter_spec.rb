require 'rails_helper'

RSpec.describe NoteCounter do

  fixtures(:users, :notes)
  let(:user) { users(:user1) }
  let(:note1) { notes(:note1) }

  it "should count non-root notes regardless of descendants" do
    url = 'http://climate.com'
    note1.children.create!(content: "This note has an #{url} inside", user: user)

    result = NoteCounter.call(url)

    expect(result.success?).to be true
    expect(result.value).to eq 1
  end

  it "should count root notes if their eldests are not empty" do
    url = 'http://climate.com'
    t1 = Note.create!(content: "This note has an #{url} inside", user: user)
    t1.children.create!(content: "whatever", user: user)

    result = NoteCounter.call(url)

    expect(result.success?).to be true
    expect(result.value).to eq 1
  end

  it "should NOT count root a note if its eldest is empty" do
    url = 'http://climate.com'
    t1 = Note.create!(content: "This note has an #{url} inside", user: user)
    t1.children.create!(content: "", user: user)

    result = NoteCounter.call(url)

    expect(result.success?).to be true
    expect(result.value).to eq 0
  end

  it "should return NoteCounter::MAX_COUNT if the count is higher" do
    url = 'http://climate.com'
    15.times { note1.children.create!(content: "This note has an #{url} inside", user: user) }

    result = NoteCounter.call(url)

    expect(result.success?).to be true
    expect(result.value).to eq NoteCounter::MAX_COUNT
  end

  it "should return 0 if no url provided" do
    result = NoteCounter.call

    expect(result.success?).to be true
    expect(result.value).to eq 0
  end

end
