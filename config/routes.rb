# frozen_string_literal: true

Rails.application.routes.draw do
  scope :v1, defaults: { format: :json } do
    get "/notes/:id/related", to: "notes#related"
    resources :users, only: [:index, :show, :create, :update] do
      collection do
        post "confirmation"
        get "me"
      end
    end
    devise_for :users, controllers: { sessions: :sessions },
                       path_names: { sign_in: :login, sign_out: :logout },
                       skip: [:confirmations], skip_helpers: [:confirmations]
    resources :notes, only: [:index, :show, :create, :update, :destroy] do
      collection do
        get "count"
      end
    end
    get "ping", to: "ping#ping"


    get "banana", to: "banana#get"
    post "banana", to: "banana#post"
  end
end
