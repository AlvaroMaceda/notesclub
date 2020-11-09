import * as React from 'react'
import { User } from './User'
import { Note, Reference } from './notes/Note'
import { fetchBackendUser, fetchBackendNotes } from './backendSync'
import ReferenceRenderer from './notes/ReferenceRenderer'
import NoteCreator from './notes/NoteCreator'

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
    const lastCreatedAt = notes ? notes[notes.length - 1].created_at : undefined
    if (notes && lastCreatedAt && document.scrollingElement && window.innerHeight + document.documentElement.scrollTop + 5 >= document.scrollingElement.scrollHeight) {
      fetchBackendNotes({
        ancestry: null,
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
            ancestry: null,
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
          {blogger && notes && currentUser &&
            <>
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
      </div>
    )
  }
}

export default Feed
