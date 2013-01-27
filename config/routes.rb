TenFoot::Application.routes.draw do
  root :to => 'home#index'

  match 'files/path(/:path)', to: 'files#path', as: :file_path, constraints: {path: /.+/}

  resources :feeds, only: [:index, :show]
  resources :movies, only: [:index, :show]
  resources :series, only: [:index, :show]

  resources :files, only: [:index, :show] do
    put :progress, on: :member
  end
end
