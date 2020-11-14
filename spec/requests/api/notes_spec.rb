# frozen_string_literal: true

require "swagger_helper"

RSpec.describe "Notes API" do
  path "/v1/notes/{id}/related" do
    get "retrieves related notes" do
      produces "application/json"
      parameter name: :id, in: :path, type: :string

      # response "200", "related notes found" do
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

      response "404", ":not_found" do
        let(:id) { "inexistent_note" }
        run_test!
      end
    end # get
  end # path
end
