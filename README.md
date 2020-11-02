# Book Notes Club
https://notes.club

## Background

Wikipedia has more than 27 million registered patrons who rely on its knowledge-base for essential encyclopedic information. Goodreads similarly has a community of more than 90 million book-loving patrons. But there isn't a website which combines the two and lets the world work together to grow a shared graph of books notes.

## License
[MIT license](LICENSE)

## Overview
This project consists of a frontend in React (/front) and a Ruby on Rails API.

## Backend (Ruby on Rails API)

### Database

You'll need a PostreSQL database to run the application.

There is a `docker-compose-yml` file which will start a PostreSQL and a pgAdmin servers. You will need `docker` and `docker-compose` installed in your system. Then, run the following and you should have a postgresql server available for the project:
```
docker-compose up
```

You can acess pgadmin with your browser at http://localhost:8080 (User is "devuser", password "devuser". It will ask a password when connecting to a database, just leave it blank and press enter) You can also access the database server using the command-line client: `psql "user=devuser password=devuser host=localhost port=5433 dbname=notes_dev"`

The servers can be run separately with `docker-compose up database -d` for the database and `docker-compose up pgadmin -d` for pgAdmin.

To completely remove the containers and volumes (note that this will destroy all data): `docker-compose down -v`

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

### Configure env variables
In development and test environments variables are read from `./.env` file. You should copy the provided `./.env.example` file to `.env`  before running the project. This will affect front and backend environment variables.

Alternatively, you can add environment variables to your bash_profile:
```
# open ~/.bash_profile
export REACT_APP_NOTESCLUB_API_BASE_URL=http://localhost:3000
export REACT_APP_NOTESCLUB_FRONT_BASE_URL=http://localhost:3001
```

Then, run `source ~/.bash_profile` or open a new console to apply the changes.

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

You can also user [Guard](https://github.com/guard/guard) to watch changes and run tests on modified files:
```
bundle exec guard
```


## Frontend (React)

### Start server
```
cd front
yarn install --check-files
yarn start
```

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
