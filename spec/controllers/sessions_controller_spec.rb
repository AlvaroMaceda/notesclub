# frozen_string_literal: true

require "rails_helper"

RSpec.describe SessionsController, type: :request do
  fixtures :users
  context "Login" do
    let(:user) { users(:user1) }
    before do
      @params = { email: "hec2@hec.com", password: "hec2hec", username: "kkkk", invited_by: user }
      @user = User.create!(@params)
    end

    it "returns http success" do
      post "/v1/users/login", { params: { email: "hec2@hec.com", password: "hec2hec" } }
      expect(response).to have_http_status(:success)
    end

    it "sets cookie" do
      # It seems we can not test encrypted cookies in controller specs https://github.com/rails/rails/issues/27145
      # TODO: Test it in an integration spec
      expect_any_instance_of(ActionDispatch::Cookies::CookieJar).to receive(:signed).and_return({ jwt: nil })
      post "/v1/users/login", { params: { email: "hec2@hec.com", password: "hec2hec" } }
      expect(cookies[:jwt])
    end

    it "returns user attributes" do
      post "/v1/users/login", { params: { email: "hec2@hec.com", password: "hec2hec" } }
      json = JSON.parse(response.body)
      expect(json).to eq({ "user" => { "id" => @user.id, "name" => @user.name, "username" => @user.username } })
    end
  end
end
