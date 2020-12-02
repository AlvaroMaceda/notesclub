import * as React from 'react'
import { User } from './User'
import { Note, Reference } from './notes/Note'
import { fetchBackendUser, fetchBackendNotes } from './backendSync'
import ReferenceRenderer from './notes/ReferenceRenderer'
import { Link } from 'react-router-dom'
import NoteCreator from './notes/NoteCreator'

interface UserPageProps {
  blogUsername: string
  setAppState: Function
  currentUser?: User | null
}

interface UserPageState {
  notes?: Reference[]
  blogger?: User
  selectedNote: Note | null
}

class UserPage extends React.Component<UserPageProps, UserPageState> {
  constructor(props: UserPageProps) {
    super(props)

    this.state = {
      selectedNote: null
    }
  }

  componentDidMount() {
    this.fetchBackendUserNotes()
  }

  componentWillMount() {
    window.addEventListener('scroll', this.loadMore)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.loadMore)
  }

  loadMore = () => {
    const { notes, blogger } = this.state
    const lastCreatedAt = notes ? notes[notes.length - 1].created_at : undefined
    if (blogger && notes && lastCreatedAt && document.scrollingElement && window.innerHeight + document.documentElement.scrollTop + 5 >= document.scrollingElement.scrollHeight) {
      fetchBackendNotes({
        user_ids: [blogger.id],
        ancestry: null,
        skip_if_no_descendants: true,
        include_descendants: true,
        include_ancestors: true,
        include_user: true,
        limit: 5,
        created_at_lt: lastCreatedAt
      }, this.props.setAppState)
        .then(newNotes => newNotes && this.setState({ notes: notes.concat(newNotes as Reference[]) }))
    }
  }

  fetchBackendUserNotes = () => {
    const { blogUsername } = this.props
    fetchBackendUser(blogUsername)
      .then(blogger => {
        this.setState({ blogger: blogger })

        if (blogger) {
          fetchBackendNotes({
            user_ids: [blogger.id],
            ancestry: null,
            skip_if_no_descendants: true,
            include_descendants: true,
            include_ancestors: true,
            include_user: true,
            limit: 20 }, this.props.setAppState)
            .then(notes => notes && this.setState({ notes: notes as Reference[] }))
        }
      })
  }

  updateState = (partialState: Partial<UserPageState>) => {
    const newState: UserPageState = { ...this.state, ...partialState }
    this.setState(newState)
  }
  public render() {
    const { blogger, notes, selectedNote } = this.state
    const { currentUser, setAppState } = this.props

    return (
      <div className="container">
        { currentUser &&
          <NoteCreator
            currentUser={currentUser}
            setAppState={setAppState}
          />
        }
        <div className="topic-container">
          {blogger && notes &&
            <>
              {blogger.name === "Help" &&
                <Link to="/" onClick={() => window.location.href = "/"}>Browse all notes</Link>
              }
              <h1>{blogger.name || blogger.username}'s recent notes</h1>
              {notes.map((ref) => (
                <ReferenceRenderer
                  key={ref.id}
                  note={ref}
                  rootNote={ref}
                  selectedNote={selectedNote}
                  setUserNotePageState={this.updateState}
                  setAppState={this.props.setAppState}
                  currentUser={currentUser}
                  showUser={true} />
              ))}
            </>
          }
          {(!blogger || !notes) &&
            <p>Loading</p>
          }
        </div>
      </div>
    )
  }
}

export default UserPage
