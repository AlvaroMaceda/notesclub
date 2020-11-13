# frozen_string_literal: true

class BananaController < ApplicationController
  skip_before_action :authenticate_user!

  def banana
    render json: "banana", status: :ok
  end
end
