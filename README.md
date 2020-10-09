# Book Notes Club
https://book.notes.club

## Background

Wikipedia has more than 27 million registered patrons who rely on its knowledge-base for essential encyclopedic information. Goodreads similarly has a community of more than 90 million book-loving patrons. But there isn't a website which combines the two and lets the world work together to grow a shared graph of books notes.

## License
[MIT license](LICENSE)

## Overview
This project consists of a frontend in React (/front) and a Ruby on Rails API.

## Backend (Ruby on Rails)

### Create and populate database with seed data
```
cp config/database.yml.example config/database.yml
rails db:setup
```

This demo user will have been created:
```
email: marie@curie.com
password: mariecurie
```

### Add env variables to bash_profile
```
# open ~/.bash_profile
export REACT_APP_NOTESCLUB_API_BASE_URL=http://localhost:3000
export REACT_APP_NOTESCLUB_FRONT_BASE_URL=http://localhost:3001
```

Now run `source ~/.bash_profile` or open a new console to apply the changes.

### Start server
```
bundle install
rails s
```

### Open browser

Open `http://localhost:3000/v1/ping` on your browser and the API will return `pong`.

### Tests
```
bundle exec rspec
```

## Frontend (React)

### Start server
```
cd front
yarn install --check-files
yarn start
```
`yarn start` will say that port `3000` is already in use (by the Rails API) and ask if you would like to run the app on another port. Enter yes. It will use the port `3001`.

### Open browser

Open `http://localhost:3001` and you will see the log in page.

You should be able to log in with the demo credentials from the backend' step [Create and populate database with seed data](https://github.com/notesclub/notesclub#create-and-populate-database-with-seed-data).

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
