import * as React from 'react'
import { User } from './User'
import { Note, Reference } from './notes/Note'
import { fetchBackendUser, fetchBackendNotes } from './backendSync'
import ReferenceRenderer from './notes/ReferenceRenderer'
import { Link } from 'react-router-dom'

interface FeedProps {
  blogUsername: string
  setAppState: Function
  currentUser?: User
}

interface FeedState {
  notes?: Reference[]
  blogger?: User
  selectedNote: Note | null
}

class Feed extends React.Component<FeedProps, FeedState> {
  constructor(props: FeedProps) {
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
    const { notes } = this.state
    const lastId = notes ? notes[notes.length - 1].id : undefined
    if (notes && lastId && document.scrollingElement && window.innerHeight + document.documentElement.scrollTop + 5 >= document.scrollingElement.scrollHeight) {
      fetchBackendNotes({
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
            ancestry: null,
            skip_if_no_descendants: true,
            include_descendants: true,
            include_ancestors: true,
            include_user: true,
            limit: 20
          }, this.props.setAppState)
            .then(notes => notes && this.setState({ notes: notes as Reference[] }))
        }
      })
  }

  updateState = (partialState: Partial<FeedState>) => {
    const newState: FeedState = { ...this.state, ...partialState }
    this.setState(newState)
  }

  public render () {
    const { blogger, notes, selectedNote } = this.state
    const { currentUser } = this.props

    return (
      <div className="topic-container container">
        {blogger && notes && currentUser &&
          <>
            <Link to="/books/new" className="btn btn-primary" onClick={() => window.location.href="/books/new"}>Add book notes</Link>
            <h1>Recent notes</h1>
            <ul>
              {notes.map((ref) => (
                <ReferenceRenderer
                  key={ref.id}
                  note={ref}
                  selectedNote={selectedNote}
                  setUserNotePageState={this.updateState}
                  setAppState={this.props.setAppState}
                  currentUser={currentUser}
                  showUser={true} />
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

export default Feed
