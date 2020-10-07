# Book Notes Club
https://book.notes.club

## Background

Wikipedia has more than 27 million registered patrons who rely on its knowledge-base for essential encyclopedic information. Goodreads similarly has a community of more than 90 million book-loving patrons. But there isn't a website which combines the two and lets the world work together to grow a shared graph of books notes.

## License
[MIT license](LICENSE)

## Overview
This project consists of a Ruby on Rails backend and a React single page application (/front).

## Backend (Ruby on Rails)

### Create db:
rails db:create
rails db:migrate

### Add env variables to .bash_profile

I use ngrok.com so authentication between frontend and backend works in development. However, it requires a pro account so we need to add here another free option.
export REACT_APP_NOTESCLUB_API_BASE_URL=http://replace.with.your.url.ngrok.io
export REACT_APP_NOTESCLUB_FRONT_BASE_URL=http://replace.with.your.url.ngrok.io

### Start server
`rails s`

### Run specs
`bundle exec rspec`

## Frontend (React)

### Start server
`cd front`
`yarn start`

### Jest specs
`cd front`
`yarn test`

### Integration specs
`cd front`
`./node_modules/.bin/cypress open`
