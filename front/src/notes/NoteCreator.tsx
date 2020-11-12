import * as React from 'react'
import ReactTextareaAutocomplete from "@webscopeio/react-textarea-autocomplete"
import { Item } from './Item'
import { User } from './../User'
import { fetchSuggestions } from './autocompleteUtils'
import './../NoteCreator.scss'
import { Button } from 'react-bootstrap'
import { newNote } from './Note'
import { createBackendNote } from './../backendSync'

interface NoteCreatorProps {
  currentUser: User
  setAppState: Function
}

interface NoteCreatorState {
  content: string
}

const auto_grow = (element: HTMLElement) => {
  element.style.height = "50px";
  element.style.height = (element.scrollHeight) + "px";
}

class NoteCreator extends React.Component<NoteCreatorProps, NoteCreatorState> {
  private textAreaRef: ReactTextareaAutocomplete<{ username: string; content: string; }> | null

  constructor(props: NoteCreatorProps) {
    super(props)

    this.state = {
      content: ""
    }
    this.textAreaRef = null
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target
    auto_grow(event.target)
    this.setState({ content: target.value })
  }

  createNote = () => {
    const { currentUser, setAppState } = this.props
    const { content } = this.state

    const note = newNote({
      user_id: currentUser.id,
      ancestry: null,
      position: -1, // We'll replace this with null before sending it to the backend so it adds it to the end
      content: ""
    })
    const args = { note: note, setAppState: setAppState }
    createBackendNote(args)
      .then(note => {
        window.location.href = `/${currentUser.username}/${note.slug}?add=${encodeURIComponent(content)}`
      })
  }

  onKeyDown(event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { content } = this.state

    if (event.key === "Enter") {
      if (content === "") {
        event.preventDefault()
      } else {
        event.preventDefault()
        this.createNote()
      }
    }
  }

  public render () {
    const { content } = this.state
    const { currentUser, setAppState } = this.props

    return (
      <div className="create-note">
        <div className="avatar-div">
          <img src={currentUser.avatar_url} alt="avatar" className="avatar-img" />
        </div>
        <div className="note-content">
          <ReactTextareaAutocomplete
            ref={(textAreaRef) => { this.textAreaRef = textAreaRef; }}
            onFocus={(e) => auto_grow(e.target)}
            onChange={this.handleChange as any} autoFocus
            value={content}
            onKeyDown={this.onKeyDown}
            loadingComponent={() => <span>Loading</span>}
            dropdownClassName="editNoteDropDown"
            itemClassName="editNoteItem"
            placeholder="What would you like to remember?"
            trigger={{
              "[[": {
                dataProvider: token => fetchSuggestions(token, currentUser, setAppState),
                allowWhitespace: true,
                component: Item,
                output: (item, trigger) => `[[${item.content}]]`
              },
              "#": {
                dataProvider: token => fetchSuggestions(token, currentUser, setAppState),
                component: Item,
                allowWhitespace: true,
                output: (item, trigger) => item.content.match(/\s/) ? `#[[${item.content}]]` : `#${item.content}`
              }
            }}
          />
        </div>
        <Button onClick={this.createNote}>Send</Button>
        <span className="note-creator-tip">Use [[ or # to link to other notes, tags, books, podcasts, etc.</span>
      </div>
    )
  }
}

export default NoteCreator
