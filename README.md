# Book Notes Club
https://book.notes.club

## Background

Wikipedia has more than 27 million registered patrons who rely on its knowledge-base for essential encyclopedic information. Goodreads similarly has a community of more than 90 million book-loving patrons. But there isn't a website which combines the two and lets the world work together to grow a shared graph of books notes.

## License
[MIT license](LICENSE)

## Overview
This project consists of a frontend in React (/front) and a Ruby on Rails API.

## Frontend (React)

### Start server
```
cd front
yarn start
```

### Tests
Jest:
`cd front`
`yarn test`

Integration (Cypress):
`cd front`
`./node_modules/.bin/cypress open`

## Backend (Ruby on Rails)

### Create db:
```
rails db:create
rails db:migrate
```

### Add env variables to .bash_profile

We currently use ngrok.com so authentication between frontend and backend works in development. However, it requires a pro account so we need to add here another free option. If you find how to do it, please update this.
```
export REACT_APP_NOTESCLUB_API_BASE_URL=http://replace.with.your.url.ngrok.io
export REACT_APP_NOTESCLUB_FRONT_BASE_URL=http://replace.with.your.url.ngrok.io
```

At the moment you also need recaptcha credentials - but we should fix this [soon](https://github.com/notesclub/notesclub/issues/7).
```
export REACT_APP_NOTESCLUB_RECAPTCHA_KEY=...
export NOTESCLUB_RECAPTCHA_SECRET=...
```
### Start server
`rails s`

### Tests
`bundle exec rspec`
