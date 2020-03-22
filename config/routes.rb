Rails.application.routes.draw do
  scope :v1, defaults: { format: :json} do
    devise_for :users, controllers: { sessions: :sessions },
                       path_names: { sign_in: :login, sign_out: :logout }

    resources :users, only: [:show, :update]
    resources :exercises, only: [:index, :create, :show]

    get 'ping', to: 'ping#ping'
  end
end
