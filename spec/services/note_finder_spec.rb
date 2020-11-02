# frozen_string_literal: true

require "rails_helper"

def rm_timestamps(obj)
  obj = obj.except("created_at", "updated_at")
  obj["descendants"] = obj["descendants"].map { |o| o.except("created_at", "updated_at") } if obj["descendants"]
  obj["ancestors"] = obj["ancestors"].map { |o| o.except("created_at", "updated_at") } if obj["ancestors"]
  obj["user"] = obj["user"].except("created_at", "updated_at") if obj["user"]
  obj
end

def data(a)
  return rm_timestamps(a) unless a.kind_of?(Array)
  a.map do |t|
    rm_timestamps(t.as_json)
  end
end


RSpec.describe NoteFinder do
  fixtures(:users, :notes)
  let(:user) { users(:user1) }
  let(:note1) { notes(:note1) }
  let(:note2) { notes(:note2) }
  let(:note5) { notes(:note5) }

  describe "it should find notes by ids" do
    it "when one id is provided" do
      result = NoteFinder.call(ids: note1.id, ancestry: nil)

      expect(result.success?).to be true
      expect(data(result.value)).to match_array data([note1])
    end

    it "when more than one id is provided" do
      result = NoteFinder.call(ids: [note1.id, note2.id], ancestry: nil)

      expect(result.success?).to be true
      expect(data(result.value)).to match_array data([note1, note2])
    end
  end

  it "should filter per user_ids and ancestry" do
    result = NoteFinder.call(user_ids: user.id, ancestry: nil)

    expect(result.success?).to be true
    expect(data(result.value)).to match_array([
      { "ancestry" => nil, "content" => "Climate Change", "id" => 1, "position" => 1, "user_id" => 1, "slug" => "climate_change" },
      { "ancestry" => nil, "content" => "2020-08-28",     "id" => 2, "position" => 2, "user_id" => 1, "slug" => "2020-08-28" }
    ])
  end

  describe "when include_user is true" do
    it "should ONLY include exposed USER attributes" do
      result = NoteFinder.call(ids: note1.id, ancestry: nil, include_user: true)

      expected_user_data = { "id" => note1.user.id, "name" => note1.user.name, "username" => note1.user.username }

      expect(result.success?).to be true
      expect(result.value[0]["user"].except("created_at", "updated_at")).to eq expected_user_data
    end
  end

  it "should search by like" do
    note1.update!(content: "This is great: [[https://thisurl.com/whatever]]")
    note2.update!(content: "[[https://thisurl.com/whatever]]")

    result = NoteFinder.call(content_like: "%[[https://thisurl.com/whatever]]%")

    expect(result.success?).to be true
    expect(data(result.value)).to match_array data([note1, note2])
  end

  it "should return descendants if flag is passed" do
    Note.where.not(id: [2, 3, 4]).destroy_all

    result = NoteFinder.call(ids: note2.id, include_descendants: true)

    expect(data(result.value[0])).to eq({
      "id" => 2,
      "content" => "2020-08-28",
      "user_id" => 1,
      "ancestry" => nil,
      "slug" => "2020-08-28",
      "position" => 1,
      "descendants" => [
        { "id" => 3, "position" => 1, "content" => "I started to read [[How to take smart notes]]", "user_id" => 1, "ancestry" => "2", "slug" => "jdjiwe23m" },
        { "id" => 4, "position" => 1, "content" => "I #love it", "user_id" => 1, "ancestry" => "2/3", "slug" => "ds98wekjwe" }
      ]
    })
  end
end
