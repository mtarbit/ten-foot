TenFoot::Application.routes.draw do
  root :to => 'home#index'

  match 'files/path(/:path)', to: 'files#path', as: :file_path, constraints: {path: /.+/}
  match 'files/search/:ids', to: 'files#search', as: :file_search

  resources :feeds, only: [:index, :show]

  resources :movies, only: [:index, :show] do
    match :watched, on: :member
  end

  resources :series, only: [:index, :show] do
    match :watched, on: :member
  end

  resources :files, only: [:index, :show] do
    match :progress, on: :member
    match :watched, on: :member
    match :refresh, on: :collection
  end
end
