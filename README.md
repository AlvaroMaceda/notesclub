# Book Notes Club
https://book.notes.club

## License
[MIT license](LICENSE)

## Backend

### Create db:
rails db:create
rails db:migrate

### Add env variables to .bash_profile

I use ngrok so authentication works in development. However, it requires a pro account so we need to add here another free option.
export REACT_APP_NOTESCLUB_API_BASE_URL=http://replace.with.your.url.ngrok.io
export REACT_APP_NOTESCLUB_FRONT_BASE_URL=http://replace.with.your.url.ngrok.io

### Start server:
`rails s`

## Start frontend
`cd front`
`yarn start`
