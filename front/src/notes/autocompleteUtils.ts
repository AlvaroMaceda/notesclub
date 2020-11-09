import { fetchBackendNotes } from './../backendSync'
import { User } from './../User'

export const fetchSuggestions = (token: string, currentUser: User | undefined | null, setAppState: Function) => {
  token = token.replace(/^\[/, '')
  if (currentUser) {
    return (
      fetchBackendNotes({ content_like: `%${encodeURIComponent(token)}%`, ancestry: null, user_ids: [currentUser.id] }, setAppState)
        .then(notes => notes.map((note) => {
          return (
            { username: currentUser.username, content: note.content }
          )
        }))
    )
  } else {
    return []
  }
}
