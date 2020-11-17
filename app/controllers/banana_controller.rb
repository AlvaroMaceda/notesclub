# frozen_string_literal: true

class BananaController < ApplicationController
  skip_before_action :authenticate_user!

  def get
    user = {
      id: 3,
      name: "Marie Curie",
      username: "curie",
      created_at: "2020-10-12T12:20:07.759Z",
      updated_at: "2020-11-14T17:31:00.054Z",
      avatar_url: nil
    }

    descendants = [
      {
        id: 3,
        content: "lalala",
        user_id: "1",
        ancestry: nil,
        slug: "banana",
        position: 1,
        created_at: "2020-10-23T16:35:29.977Z",
        updated_at: "2020-10-23T16:35:29.977Z"
      },
      {
        id: 4,
        content: "popopo",
        user_id: "100",
        ancestry: "33",
        slug: "potato",
        position: 1,
        created_at: "2020-10-23T16:35:29.977Z",
        updated_at: "2020-10-23T16:35:29.977Z"
      }
    ]

    response = {
      id: 3,
      content: "lalala",
      user_id: "1",
      ancestry: nil,
      slug: "banana",
      position: 1,
      created_at: "2020-10-23T16:35:29.977Z",
      updated_at: "2020-10-23T16:35:29.977Z",
      descendants: descendants,
      # descendants: nil
      user: user
    }

    # p response
    puts response.to_json
    render json: response, status: :ok
  end

  def get_banana
    response = {
      banana_1: 1,
      banana_2: 2,
      something_extra: "lalala"
    }
    p response
    render json: response, status: :ok
  end

  def post
    render json: "banana", status: :created
  end
end
