# frozen_string_literal: true

require "rails_helper"

RSpec.describe NotesController, type: :request do
  fixtures(:users, :notes)
  let(:user) { users(:user1) }
  let(:note1) { notes(:note1) }
  let(:note2) { notes(:note2) }
  let(:note5) { notes(:note5) }

  before do
    log_in(user)
  end

  def rm_timestamps!(obj)
    obj.except!("created_at", "updated_at")
    obj["descendants"].map { |o| o.except!("created_at", "updated_at") } if obj["descendants"]
    obj["ancestors"].map { |o| o.except!("created_at", "updated_at") } if obj["ancestors"]
    obj["user"].except!("created_at", "updated_at") if obj["user"]
    obj
  end

  def rm_timestamps_from_array!(arr)
    arr.map { |obj| rm_timestamps!(obj) }
  end

  def prep(t)
    rm_timestamps!(t)&.sort_by { |k, v| k }
  end

  context "#index" do
    it "should find notes by ids" do
      get "/v1/notes", params: { ids: [note1.id, note2.id], ancestry: nil }
      expect(response).to have_http_status(:success)
      notes = JSON.parse(response.body).sort_by { |t| t["id"] }.map { |t| prep(t) }
      expect(notes).to eq([prep(note1.attributes), prep(note2.attributes)])
    end

    it "should filter per user_ids and ancestry" do
      get "/v1/notes", params: { user_ids: [user.id], ancestry: nil }
      expect(response).to have_http_status(:success)
      notes = JSON.parse(response.body).sort_by { |t| t["id"] }.map { |t| prep(t) }
      expect(notes).to eq([
        prep({ "ancestry" => nil, "content" => "Climate Change", "id" => 1, "position" => 1, "user_id" => 1, "slug" => "climate_change" }),
        prep({ "ancestry" => nil, "content" => "2020-08-28",     "id" => 2, "position" => 2, "user_id" => 1, "slug" => "2020-08-28" })
      ])
      expect(response.status).to eq(200)
    end

    describe "when include_user is true" do
      it "should ONLY include exposed USER attributes" do
        get "/v1/notes", params: { ids: [note1.id], ancestry: nil, include_user: true }
        expect(response).to have_http_status(:success)
        note = JSON.parse(response.body)[0]
        expect(note["user"].except("created_at", "updated_at")).to eq({ "id" => note1.user.id, "name" => note1.user.name, "username" => note1.user.username })
      end
    end

    it "should search by like" do
      note1.update!(content: "This is great: [[https://thisurl.com/whatever]]")
      note2.update!(content: "[[https://thisurl.com/whatever]]")
      get "/v1/notes", params: { content_like: "%[[https://thisurl.com/whatever]]%" }
      expect(response).to have_http_status(:success)
      notes = JSON.parse(response.body).sort_by { |t| t["id"] }.map { |t| prep(t) }
      expect(notes).to eq([prep(note1.attributes), prep(note2.attributes)])
    end
  end

  context "#show" do
    it "should return descendants if flag is passed" do
      Note.where.not(id: [2, 3, 4]).destroy_all
      get "/v1/notes/#{note2.id}", params: { include_descendants: true }
      expect(response).to have_http_status(:success)
      note2 = JSON.parse(response.body)
      expect(rm_timestamps!(note2)).to eq({
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
      expect(response.status).to eq(200)
    end
  end

  context "#create" do
    it "should create the note" do
      t0 = Note.create!(content: "whatever whatever", user: user)
      expect { post "/v1/notes", params: { note: { content: "The sky is blue", ancestry: t0.id.to_s, user_id: user.id } } }.to change { Note.count }.by(1)
      expect(response.status).to eq 201
      expect(Note.last.attributes.slice("content", "ancestry", "user_id", "position")).to eq("content" => "The sky is blue", "ancestry" => t0.id.to_s, "user_id" => user.id, "position" => 1)
    end

    it "should return unauthorized if user_id doesn't match the auhtenticated user" do
      expect(user.id).not_to eq(2)
      t0 = Note.create!(content: "whatever whatever", user: user)
      expect { post "/v1/notes", params: { content: "The sky is blue", ancestry: t0.id.to_s, user_id: 2 } }.not_to change { Note.count }
      expect(response.status).to eq 401
    end
  end

  context "#update" do
    it "should update the content" do
      note1.update!(user_id: user.id)
      put "/v1/notes/#{note1.id}", params: { note: { content: "The sky is blue" } }
      expect(response.status).to eq 200
      expect(note1.reload.content).to eq("The sky is blue")
    end

    it "should return unauthorized if user_id doesn't match the auhtenticated user" do
      expect(note5.user_id).not_to eq(user.id)
      put "/v1/notes/#{note5.id}", params: { note: { content: "The sky is blue" } }
      expect(response.status).to eq 401
      expect(note1.reload.content).not_to eq("The sky is blue")
    end
  end

  context "#destroy" do
    it "should delete a note" do
      expect { delete "/v1/notes/#{note1.id}" }.to change { Note.count }.by(-1)
      expect(response.status).to eq 200
    end

    it "should return unauthorized if id doesn't match the auhtenticated user" do
      expect(note5.user_id).not_to eq(user.id)
      expect { delete "/v1/notes/#{note5.id}" }.not_to change { Note.count }
      expect(response.status).to eq 401
    end
  end

  describe "#count" do
    it "should count non-root notes regardless of descendants" do
      note1.children.create!(content: "http://climate.com", user: user)
      get "/v1/notes/count?url=http://climate.com"
      count = JSON.parse(response.body)
      expect(count).to eq 1
    end

    it "should NOT count root a note if its eldest is empty" do
      t1 = Note.create!(content: "http://climate.com", user: user)
      t1.children.create!(content: "", user: user)
      get "/v1/notes/count?url=http://climate.com"
      count = JSON.parse(response.body)
      expect(count).to eq 0
    end

    it "should count root notes if their eldests are not empty" do
      t1 = Note.create!(content: "http://climate.com", user: user)
      t1.children.create!(content: "whatever", user: user)
      get "/v1/notes/count?url=http://climate.com"
      count = JSON.parse(response.body)
      expect(count).to eq 1
    end

    it "should return 10 if the count is higher" do
      15.times { note1.children.create!(content: "http://climate.com", user: user) }
      get "/v1/notes/count?url=http://climate.com"
      count = JSON.parse(response.body)
      expect(count).to eq 10
    end
  end
end
