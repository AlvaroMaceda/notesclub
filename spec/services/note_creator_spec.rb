require 'rails_helper'

RSpec.describe NoteCreator do

  fixtures(:users)
  let(:user) { users(:user1) }

  it 'creates notes' do
    data = {
      content: 'Some irrelevant content',
      ancestry: nil,
      position: 0,
      slug: nil,
      user_id: user.id
    }

    result = NoteCreator.call data

    expect(result.success?).to be true
    expect(result.value).to be_a Note
  end

  it 'returns error on invalid data' do
    data = {
      content: 'More irrelevant content',
      ancestry: nil,
      position: -8,
      slug: nil,
      user_id: -10
    }

    result = NoteCreator.call data
    
    expect(result.error?).to be true
    expect(result.errors).not_to be nil
  end

end
