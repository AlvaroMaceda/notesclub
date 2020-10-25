require 'rails_helper'

RSpec.describe NoteDeleter do
  fixtures :users
  let(:user1) { users(:user1) }

  it "should destroy note and descendants", focus:true do
    t1 = Note.create!(content: "bla", user: user1)
    t2 = t1.children.create!(content: "bla", user: user1)
    t3 = t1.children.create!(content: "bla", user: user1)
    t4 = t3.children.create!(content: "bla", user: user1)

    result = nil
    expect { result = NoteDeleter.call(t1, include_descendants: true) }.to change { Note.count }.by(-4)
    expect(result).to eq(true)
  end
end
