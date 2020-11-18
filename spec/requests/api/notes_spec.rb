# frozen_string_literal: true

require "swagger_helper"

RSpec.describe "Notes API", focus: true do
  fixtures(:users, :notes)
  let(:user) { users(:user1) }

  before do |test|
    log_in(user) unless test.metadata[:logged_out]
  end

  path "/v1/notes/{id}/related" do
    get "retrieves related notes" do
      produces "application/json"
      parameter name: :id, in: :path, type: :string

      # response "200", "Related notes found" do
      #   schema type: :object,
      #       properties: {
      #         id: { type: :integer },
      #         title: { type: :string },
      #         content: { type: :string }
      #       },
      #       required: [ 'id', 'title', 'content' ]
      #   let(:blog) { { title: "foo", content: "bar" } }

      #   run_test! do |response|
      #     # data = JSON.parse(response.body)
      #     # expect(data["title"]).to eq("foo")
      #   end
      # end

      response "401", "Unauthorized" do
        let(:id) { "a_note" }

        # We must use before/it form of calling to pass :logged_out to "before" block
        before do |example|
          submit_request(example.metadata)
        end
        it "returns a 401 response", :logged_out do |example|
          assert_response_matches_metadata(example.metadata)
        end
      end

      response "404", "Note not found" do
        # skip && next # Note that you must add a next statement to really skip test
        schema "$ref" => "#/components/schemas/rfc7807"

        let(:id) { "inexistent_note" }
        run_test! do |response|
          response = JSON.parse(response.body)
          expect(response["type"]).to eq "/error/types/item_not_found"
          expect(response["status"]).to eq 404
        end
      end
    end # get
  end # path
end
