import * as React from 'react'
import { fetchBackendNotes } from './backendSync'
import { NoteWithFamily } from './notes/Note'
import { Link } from 'react-router-dom'
import { User } from './User'
import { Button } from 'react-bootstrap'

interface BooksPageProps {
  setAppState: Function
  currentUser?: User | null
}

interface BooksPageState{
  notes?: NoteWithFamily[]
}

class BooksPage extends React.Component<BooksPageProps, BooksPageState> {
  constructor(props: BooksPageProps) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    fetchBackendNotes({ ancestry: null, content_like: "%(book)%", include_user: true, skip_if_no_descendants: true }, this.props.setAppState)
      .then(notesWithUsers => {
        this.setState({ notes: notesWithUsers })
      })
  }

  renderNote = (note: NoteWithFamily, user: User, index: number) => {
    const user_path = user ? `/${user.username}` : ""
    const path = `${user_path}/${note.slug}`
    return (
      <li key={index}>
        <Link to={path} onClick={() => window.location.href = path}>{note.content}</Link>
        {" · "}
        <Link to={user_path} onClick={() => window.location.href = user_path}>{user.name}</Link>
      </li>
    )
  }

  public render () {
    const { notes } = this.state
    const { currentUser } = this.props

    return (
      <div className="container">
        <h1>Books:</h1>
        {!notes &&
          <>Loading</>
        }
        {notes &&
          <>
            <ul>
              {notes.map((note, index) => note.user && this.renderNote(note, note.user, index))}
            </ul>
            {!currentUser &&
              <>
                <Link to="/login" onClick={() => window.location.href = "/login"}>Log in</Link>
                {" to add your notes."}
              </>
            }
            {currentUser &&
              <>
                <Button onClick={() => window.location.href = "/books/new"}>Add book notes</Button>
                {" or browse "}
                <Link to="/new">recent notes</Link>.
              </>
            }
          </>
        }
      </div>
    )
  }
}

export default BooksPage
