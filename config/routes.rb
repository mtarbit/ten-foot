TenFoot::Application.routes.draw do
  root :to => 'home#index'

  match 'files/populate_video_files', to: 'files#populate_video_files'
  match 'files/populate_movies', to: 'files#populate_movies'
  match 'files/populate_series', to: 'files#populate_series'
  match 'files(/:path)', to: 'files#index', as: :files, constraints: {path: /.+/}

  resources :movies, only: [:index, :show]
  resources :series, only: [:index, :show]
end
