# frozen_string_literal: true

require "swagger_helper"

RSpec.describe "Notes API", focus: true do
  # skip "This method is for testing things"
  # next # Note that you must add a next statement to really skip test

  path "/v1/banana" do
    get "retrieves bananas" do
      tags "focus"
      produces "application/json"

      response "200", "banana found" do
        schema "$ref" => "#/components/schemas/note"

        run_test! do |response|
          # p JSON.parse(response.body)
        end
      end
    end
  end
end
