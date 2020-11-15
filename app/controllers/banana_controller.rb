# frozen_string_literal: true

class BananaController < ApplicationController
  skip_before_action :authenticate_user!

  def get
    response = [
     { id: "patata" },
     { id: "boniato" },
     "uncomment to fail"
    ]
    # response = {
    #   a: 1, b: "2"
    # }
    response = [
      {
        id: "3",
        content: "lalala",
        user_id: "1",
        ancestry: nil,
        slug: "banana",
        position: 1,
        created_at: "2020-10-23T16:35:29.977Z",
        updated_at: "2020-10-23T16:35:29.977Z"
      },
      {
        id: "4",
        content: "popopo",
        user_id: "100",
        ancestry: "33",
        slug: "potato",
        position: 1,
        created_at: "2020-10-23T16:35:29.977Z",
        updated_at: "2020-10-23T16:35:29.977Z"
      }
    ]
    p response
    render json: response, status: :ok
  end
  def post
    render json: "banana", status: :created
  end
end
