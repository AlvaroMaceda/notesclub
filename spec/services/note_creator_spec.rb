# frozen_string_literal: true

require "rails_helper"

RSpec.describe NoteCreator do
  fixtures(:users)
  let(:user) { users(:user1) }

  it "creates notes" do
    data = {
      content: "Some irrelevant content",
      ancestry: nil,
      position: 1,
      slug: "some_irrelevant_slug",
      user_id: user.id
    }

    result = NoteCreator.call data

    expect(result.success?).to be true
    expect(rm_timestamps(result.value).except(:id)).to eq data
  end

  it "returns descendants if :include_descendants specified" do
    # Can a note with descendants be created here?
  end

  it "returns ancestors if :include_ancestors specified" do
    t0 = Note.create!(content: "note 0", user: user)
    note_data = {
      content: "Some irrelevant content",
      ancestry: t0.id.to_s,
      position: 1,
      slug: "some_irrelevant_slug",
      user_id: user.id
    }
    params = note_data.merge({
      include_ancestors: :truthy_value
    })
    expected_data = note_data.merge({ ancestors: [rm_timestamps(t0.as_json) ] })

    result = NoteCreator.call params

    expect(result.success?).to be true
    expect(rm_timestamps(result.value).except(:id)).to eq expected_data
  end

  it "returns user data if :include_user specified" do
    t0 = Note.create!(content: "note 0", user: user)
    note_data = {
      content: "Some irrelevant content",
      ancestry: t0.id.to_s,
      position: 1,
      slug: "some_irrelevant_slug",
      user_id: user.id
    }
    params = note_data.merge({
      include_ancestors: :truthy_value
    })
    expected_data = note_data.merge({ ancestors: [rm_timestamps(t0.as_json) ] })

    result = NoteCreator.call params

    expect(result.success?).to be true
    expect(rm_timestamps(result.value).except(:id)).to eq expected_data
  end

  it "returns error on invalid data" do
    data = {
      content: "More irrelevant content",
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
