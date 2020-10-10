Rails.application.routes.draw do
  scope :v1, defaults: { format: :json} do
    resources :users, only: [:index, :show, :create, :update] do
      collection do
        post 'confirmation'
        get 'me'
      end
    end
    devise_for :users, controllers: { sessions: :sessions },
                       path_names: { sign_in: :login, sign_out: :logout },
                       skip: [:confirmations], skip_helpers: [:confirmations]
    resources :topics, only: [:index, :show, :create, :update, :destroy] do
      collection do
        get 'count'
      end
    end
    get 'ping', to: 'ping#ping'
  end
end
