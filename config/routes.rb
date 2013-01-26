TenFoot::Application.routes.draw do
  root :to => 'home#index'

  match 'feeds', to: 'feeds#index'
  match 'feeds/show/:id', to: 'feeds#show', as: :feeds_show

  resources :movies, only: [:index, :show]
  resources :series, only: [:index, :show]

  match 'files/show/:path', to: 'files#show', as: :file, constraints: {path: /.+/}
  match 'files(/:path)', to: 'files#index', as: :files, constraints: {path: /.+/}
end
