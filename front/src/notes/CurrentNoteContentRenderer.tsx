import * as React from 'react'
import { Form, Button, Modal } from 'react-bootstrap'
import { Note, Reference, sameNote } from './Note'
import { User } from './../User'
import { updateBackendNote } from './../backendSync'
import StringWithHtmlLinks from './StringWithHtmlLinks'
import { deleteBackendNote } from './../backendSync'
import './CurrentNoteContentRenderer.scss'
import { escapeRegExp } from './../utils/escapeRegex'
import { withRouter } from 'react-router-dom'
import { Link, RouteComponentProps } from 'react-router-dom'

interface CurrentNoteContentRendererProps extends RouteComponentProps {
  selectedNote: Note | null
  descendants: Note[]
  references?: Reference[]
  currentNote: Note
  setUserNotePageState: Function
  setAppState: Function
  currentUser?: User | null
}

interface CurrentNoteContentRendererState {
  showDeleteModal: boolean
  lastUpdateDate?: Date
}

class CurrentNoteContentRenderer extends React.Component<CurrentNoteContentRendererProps, CurrentNoteContentRendererState> {

  constructor(props: CurrentNoteContentRendererProps) {
    super(props)

    this.state = {
      showDeleteModal: false
    }
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target
    const value = target.value
    let { currentNote } = this.props
    let { selectedNote, descendants, references } = this.props

    const escapedContent = escapeRegExp(currentNote.content)

    if (selectedNote && references) {
      descendants = descendants.map((descendant) => {
        if (descendant.user_id === currentNote.user_id) {
          descendant.content = descendant.content.replace(new RegExp('\\[\\[' + escapedContent + '\\]\\]', 'g'), `[[${value}]]`)
        }
        return (descendant)
      })
      references = references.map((reference) => {
        if (reference.user_id === currentNote.user_id) {
          reference.content = reference.content.replace(new RegExp('\\[\\[' + escapedContent + '\\]\\]', 'g'), `[[${value}]]`)
        }
        return (reference)
      })
      selectedNote.content = value

      this.props.setUserNotePageState({
        selectedNote: selectedNote,
        currentNote: selectedNote,
        descendants: descendants,
        references: references
      })
      const startTime = new Date()

      currentNote.slug = "" // We want the backend to calculate it from the content and append something if there is already a note with that slug
      // We also need to update all notes which include [[currentNote.content]] in their content
      updateBackendNote(currentNote, this.props.setAppState, true)
        .then(note => {
          const { lastUpdateDate } = this.state
          if (!lastUpdateDate || startTime > lastUpdateDate) {
            this.setState({ lastUpdateDate: startTime })
            if (note && note.slug) {
              this.props.history.push(note.slug)
              const { setUserNotePageState } = this.props
              let { currentNote } = this.props
              currentNote.slug = note.slug
              setUserNotePageState({ currentNote: currentNote })
            }
          }
        })
    }
  }

  selectCurrentNote = () => {
    this.props.setUserNotePageState({ selectedNote: this.props.currentNote })
  }


  onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const { selectedNote } = this.props

    if (selectedNote) {
      if (event.key === "Enter" || event.key === "Escape") {
        this.props.setUserNotePageState({ selectedNote: null })
      }
    }
  }

  confirmDelete = (event: React.MouseEvent<HTMLElement>) => {
    this.setState({ showDeleteModal: true })
    event.stopPropagation()
  }

  deleteNoteAndDescendants = () => {
    const { currentNote, currentUser } = this.props

    deleteBackendNote(currentNote, this.props.setAppState)
      .then(_ => window.location.href = `/${currentUser ? currentUser.username : ""}`)
      .catch(_ => {
        this.props.setAppState({ alert: { message: "Error deleting note or children :(" , variant: "danger" }})
        this.setState({ showDeleteModal: false })
      })
  }

  public render() {
    const { currentNote, currentUser, selectedNote, descendants } = this.props
    const { showDeleteModal } = this.state
    const currentNoteSelected = currentNote && selectedNote && sameNote(selectedNote, currentNote)
    const isLink = /^https?:\/\/[^\s]*$/.test(currentNote.content)
    const isOwnBlog = currentUser && currentNote && currentUser.id === currentNote.user_id
    const editCurrentNote = isOwnBlog && currentNoteSelected

    return (
      <div className="root-note">
        {!editCurrentNote &&
          <span onClick={() => this.selectCurrentNote()}>
            {isLink ?
              <StringWithHtmlLinks element={currentNote.content}/>
            :
              currentNote.content || (isOwnBlog ? <span className="lightgrey">Untitled</span> : null)
            }
            {!selectedNote && currentUser && currentNote.user_id === currentUser.id &&
              <Link to='#' onClick={this.confirmDelete} className="delete-button">
                <img src={process.env.PUBLIC_URL + '/images/close-outline.svg'} alt="delete" />
              </Link>
            }
          </span>
        }

        {editCurrentNote &&
          <Form.Group>
            <Form.Control
              type="text"
              value={currentNote.content}
              name="current_note"
              onKeyDown={this.onKeyDown}
              onChange={this.handleChange as any}
              autoFocus
            />
          </Form.Group>
        }
        <Modal show={showDeleteModal} onHide={() => this.setState({ showDeleteModal: false })}>
          <Modal.Header closeButton>
            <Modal.Title>Delete note and children?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            This will delete <b>{currentNote.content}</b> and {descendants.length} {descendants.length === 1 ? "child" : "children"}.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => this.setState({ showDeleteModal: false })}>
              Close
            </Button>
            <Button variant="primary" onClick={this.deleteNoteAndDescendants}>
              Delete note and children
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default withRouter(CurrentNoteContentRenderer)
