TenFoot::Application.routes.draw do
  root :to => 'home#index'

  match 'files/path(/:path)', to: 'files#path', as: :file_path, constraints: {path: /.+/}

  resources :feeds, only: [:index, :show]

  resources :movies, only: [:index, :show] do
    put :watched, on: :member
  end

  resources :series, only: [:index, :show] do
    put :watched, on: :member
  end

  resources :files, only: [:index, :show] do
    put :progress, on: :member
    put :watched, on: :member
  end
end
