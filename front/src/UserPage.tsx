import * as React from 'react'
import { User } from './User'
import { Note, Reference } from './notes/Note'
import { fetchBackendUser, fetchBackendNotes } from './backendSync'
import ReferenceRenderer from './notes/ReferenceRenderer'
import { Link } from 'react-router-dom'

interface UserPageProps {
  blogUsername: string
  setAppState: Function
  currentUser?: User
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
    const lastId = notes ? notes[notes.length - 1].id : undefined
    if (blogger && notes && lastId && document.scrollingElement && window.innerHeight + document.documentElement.scrollTop + 5 >= document.scrollingElement.scrollHeight) {
      fetchBackendNotes({
        user_ids: [blogger.id],
        ancestry: null,
        skip_if_no_descendants: true,
        include_descendants: true,
        include_ancestors: true,
        include_user: true,
        limit: 5,
        id_lte: lastId - 1
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

  public render () {
    const { blogger, notes, selectedNote } = this.state
    const { currentUser } = this.props

     return (
      <div className="container">
        {blogger && notes && currentUser &&
          <>
           {"Ready to start? "}
           <Link to="/books/new" onClick={() => window.location.href = "/books/new"}>Add a note about a book</Link>.
            <h1>{blogger.name === "Help" ? "Help" : `${blogger.name}'s recent notes`}</h1>
            <ul>
              {notes.map((ref) => (
                <ReferenceRenderer
                  key={ref.id}
                  note={ref}
                  selectedNote={selectedNote}
                  setUserNotePageState={this.updateState}
                  setAppState={this.props.setAppState}
                  currentUser={currentUser}
                  showUser={false} />
              ))}
            </ul>
          </>
        }
        { (!blogger || !notes) &&
          <p>Loading</p>
        }
      </div>
    )
  }
}

export default UserPage
