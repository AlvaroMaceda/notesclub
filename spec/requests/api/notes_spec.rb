# frozen_string_literal: true

require "swagger_helper"

RSpec.describe "Notes API" do
  fixtures(:users, :notes)
  let(:logged_user) { users(:user3) }
  let(:user1) { users(:user1) }
  let(:user2) { users(:user2) }

  before do |test|
    log_in(logged_user) unless test.metadata[:logged_out]
  end

  path "/v1/notes/{id}/related" do
    get "retrieves related notes" do
      tags "notes"
      produces "application/json"
      parameter name: :id, in: :path, type: :string, required: true
      parameter name: :include_ancestors, in: :query, type: :boolean, required: false
      parameter name: :include_descendants, in: :query, type: :boolean, required: false
      parameter name: :include_user, in: :query, type: :boolean, required: false

      response "200", "Successful operation" do
        schema "$ref" => "#/components/schemas/notes_array"

        let(:note) { make_note(
          content: "Note to be linked",
          ancestry: nil,
          slug: "note",
          user_id: user1.id
        )}
        let(:id) { note["id"].to_s }

        let(:include_ancestors) { "true" }
        let(:include_descendants) { "true" }
        let(:include_user) { "true" }

        it "calls NoteRelatedFinder" do |example|
          related_note_1 = make_note(
            content: "Note from the same user linking to the [[#{note["content"]}]]",
            ancestry: nil,
            slug: "related_1",
            user_id: user1.id
          )
          make_note(
            slug: "related_note",
            content: "Another note linking to the [[#{note["content"]}]] from another user",
            ancestry: nil,
            user_id: user2.id
          )
          make_note(
            slug: "non_root_related_note",
            content: "One non-root note linking to [[#{note["content"]}]]",
            ancestry: related_note_1["id"].to_s,
            user_id: user1.id
          )

          expect(NoteRelatedFinder).to receive(:call).with(
            id,
            authenticated_user_id: logged_user.id,
            include_ancestors: include_ancestors,
            include_descendants: include_descendants,
            include_user: include_user
          ).and_call_original

          submit_request(example.metadata)
          assert_response_matches_metadata(example.metadata)
        end
      end

      response "404", "Not found" do
        schema "$ref" => "#/components/schemas/rfc7807"

        let(:id) { "inexistent_note" }

        it "returns a 404 response" do |example|
          submit_request(example.metadata)
          assert_response_matches_metadata(example.metadata)

          res = JSON.parse(response.body)
          expect(res["type"]).to eq "/error/types/item_not_found"
          expect(res["status"]).to eq 404
        end
      end

      response "400", "Bad request" do
        schema "$ref" => "#/components/schemas/rfc7807"

        let(:id) { "whatever" }

        it "returns a 400 response" do |example|
          expect(NoteRelatedFinder).to receive(:call).and_return Result.error("Something terrible happened")

          submit_request(example.metadata)
          assert_response_matches_metadata(example.metadata)
        end
      end
    end # get
  end # path
end
