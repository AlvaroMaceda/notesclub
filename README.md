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
yarn install --check-files
yarn start
```
`yarn start` will say that port 3000 is already in use and ask if you'd like to run the app on another port. Enter yes.

### Tests
Jest:
```
cd front
yarn test
```

Integration (Cypress):
```
cd front
./node_modules/.bin/cypress open
```

## Backend (Ruby on Rails)

### Create and populate database with seed data:
```
cp config/database.yml.example config/database.yml
rails db:setup
```

This will create the database and populate it with a demo user:
```
email: marie@curie.com
password: mariecurie
```

### Add env variables to .bash_profile

We currently use ngrok.com so authentication between frontend and backend works in development. However, it requires a pro account so we need to add here another free option. If you find how to do it, please update this.
```
export REACT_APP_NOTESCLUB_API_BASE_URL=http://replace.with.your.url.ngrok.io
export REACT_APP_NOTESCLUB_FRONT_BASE_URL=http://replace.with.your.url.ngrok.io
```
### Start server
```
rails s
```

### Tests
```
bundle exec rspec
```
