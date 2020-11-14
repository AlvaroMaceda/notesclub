# frozen_string_literal: true

class BananaController < ApplicationController
  skip_before_action :authenticate_user!

  def get
    render json: "banana", status: :ok
  end
  def post
    p params
    render json: "banana", status: :created
  end
end
