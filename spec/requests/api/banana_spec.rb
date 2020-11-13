# frozen_string_literal: true

require "swagger_helper"

RSpec.describe "Notes API" do
  path "/v1/banana" do
    get "retrieves bananas" do
      tags "banana"
      produces "application/json", "application/xml"

      response "200", "banana found" do
        let(:blog) { { title: "foo", content: "bar" } }

        run_test! do |response|
          puts "body: #{response.body}"
          # data = JSON.parse(response.body)
          # expect(data["title"]).to eq("foo")
        end
      end

      response "200", "banana found" do
        let(:blog) { { title: "foo", content: "bar" } }

        before do |example|
          submit_request(example.metadata)
        end

        it "returns a valid 200 response" do |example|
          puts "response: #{response}"
          assert_response_matches_metadata(example.metadata)
        end
      end
    end
  end
end
