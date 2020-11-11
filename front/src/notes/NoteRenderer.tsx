import * as React from 'react'
import { Link } from 'react-router-dom'
import { Note, Reference, noteKey, newNoteWithDescendants, sameNote, noteOrAncestorBelow, noteAbove, lastDescendantOrSelf } from './Note'
import { createBackendNote, updateBackendNote, deleteBackendNote } from './../backendSync'
import { getChildren, areSibling, getParent, getRoot } from './ancestry'
import { parameterize } from './../utils/parameterize'
import { User } from './../User'
import StringWithHtmlLinks from './StringWithHtmlLinks'
import ReactTextareaAutocomplete from "@webscopeio/react-textarea-autocomplete"
import { Item } from './Item'
import './../NoteRenderer.scss'
import { fetchSuggestions } from './autocompleteUtils'

interface NoteRendererProps {
  selectedNote: Note | null
  note: Note
  rootNote?: Reference
  descendants: Note[]
  siblings: Note[]
  currentNote: Note
  renderSubnotes: boolean
  setUserNotePageState: Function
  setAppState: Function
  currentBlogger: User
  currentUser?: User | null
  isReference: boolean
  show_list?: boolean
}

const auto_grow = (element: HTMLElement) => {
  element.style.height = "5px";
  element.style.height = (element.scrollHeight) + "px";
}

interface NoteRendererState {
}

class NoteRenderer extends React.Component<NoteRendererProps, NoteRendererState> {
  // We don't use #? so we know if the result between parentheses had a hashtag:
  readonly NOTES_LINK_REGEX = /\[\[([^[]*)\]\]|#\[\[([^[]*)\]\]|#([^\s.:,;[()]*)/
  private textAreaRef: ReactTextareaAutocomplete<{ username: string; content: string; }> | null

  constructor(props: NoteRendererProps) {
    super(props)

    this.state = {}
    this.textAreaRef = null
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  indentNote = () => {
    let { descendants, selectedNote } = this.props
    let selectedNoteIndex: number | undefined = undefined
    let siblingAbove: Note | null = null

    if (selectedNote) {
      if (selectedNote.id) {
        const selected = selectedNote as Note // Don't know why it complains if I skip this
        descendants = descendants.map((descendant, index) => {
          if (sameNote(selected, descendant)) {
            selectedNoteIndex = index
          } else if (areSibling(descendant, selected)) {
            if (descendant.position === (selected).position - 1) {
              siblingAbove = descendant
            }
            if (descendant.position > (selected).position) {
              descendant.position -= 1
            }
          }
          return (descendant)
        })

        if (siblingAbove && selectedNoteIndex) {
          const newParent = siblingAbove as Note

          // Indent subtree too:
          const old_ancestry = new RegExp(`^${selected.ancestry}/${selected.id}`)
          descendants = descendants.map((descendant) => {
            // Replace ancestry of selected's descendants
            if (descendant.ancestry && old_ancestry.test(descendant.ancestry)) {
              descendant.ancestry = descendant.ancestry.replace(old_ancestry, `${selected.ancestry}/${newParent.id}/${selected.id}`)
            }
            return (descendant)
          })

          const children = getChildren(newParent, descendants)
          selectedNote.ancestry = `${selectedNote.ancestry}/${(siblingAbove as Note).id}`
          selectedNote.position = children.length + 1 // add at the end
          descendants.splice(selectedNoteIndex, 1, selectedNote)
          this.props.setUserNotePageState({descendants: descendants, selectedNote: selectedNote})
          updateBackendNote(selectedNote, this.props.setAppState)
        }
      } else {
        // selectedNote.id is null -> the note has been created and we're waiting for the id from the backend
        // We could alert but maybe it's better do nothing (they'll retry and then it will work)
        // this.props.setAppState({ alert: {variant: "danger", message: "Sorry, too fast. We're in alpha! It should be ok now."}})
        // sleep(3000).then(() => this.props.setAppState({ alert: null }))
      }
    }
  }

  unindentNote = () => {
    const { currentNote } = this.props
    let { descendants, selectedNote } = this.props
    let selectedNoteIndex: number | undefined = undefined

    if (selectedNote) {
      let selected = selectedNote as Note // Don't know why it complains if I skip this
      const parent = getParent(selectedNote, descendants)
      if (parent && !sameNote(parent, currentNote)) {
        descendants = descendants.map((descendant, index) => {
          if (sameNote(selected, descendant)) {
            selectedNoteIndex = index
          } else if (areSibling(descendant, selected)) {
            if (descendant.position > (selected).position) {
              descendant.position -= 1
            }
          } else if (areSibling(descendant, parent)) {
            if (descendant.position > parent.position) {
              descendant.position += 1
            }
          }
          return (descendant)
        })

        if (selectedNoteIndex) {
          const old_ancestry = new RegExp(`^${selected.ancestry}/${selected.id}`)
          descendants = descendants.map((descendant) => {
            // Unindent subtree too:
            if (descendant.ancestry && old_ancestry.test(descendant.ancestry)) {
              descendant.ancestry = descendant.ancestry.replace(old_ancestry, `${parent.ancestry}/${selected.id}`)
            }
            return (descendant)
          })
          selectedNote.ancestry = parent.ancestry
          selectedNote.position = parent.position + 1

          descendants.splice(selectedNoteIndex, 1, selectedNote)
          this.props.setUserNotePageState({ descendants: descendants, selectedNote: selectedNote })
          updateBackendNote(selectedNote, this.props.setAppState)
        }
      }
    }
  }

  moveNoteBelow = () => {
    const { selectedNote, siblings } = this.props
    let { descendants } = this.props

    if (selectedNote && siblings.length > selectedNote.position) {
      // Move selectedNote down (increase position by 1)
      let found = false
      descendants = descendants.map((descendant) => {
        if (!found && areSibling(descendant, selectedNote)) {
          if ((selectedNote.position + 1) === descendant.position) {
            descendant.position -= 1
            selectedNote.position += 1
            found = true
          }
        }
        return (descendant)
      })
      this.props.setUserNotePageState({ descendants: descendants, selectedNote: selectedNote })
      updateBackendNote(selectedNote, this.props.setAppState)
    }
  }

  selectNoteBelow = () => {
    const { selectedNote, siblings, descendants, currentBlogger, currentUser } = this.props
    const isOwnBlog = currentUser && currentUser.id === currentBlogger.id

    if (selectedNote && isOwnBlog) {
      const children = getChildren(selectedNote, descendants)
      let newSelected: Note | null = null
      if (children.length > 0) {
        newSelected = children[0]
      } else if (siblings.length > selectedNote.position) {
        newSelected = siblings.filter((sibling) => sibling.position === selectedNote.position + 1)[0]
      } else {
        newSelected = noteOrAncestorBelow(selectedNote, descendants)
      }

      if (newSelected) {
        this.props.setUserNotePageState({ selectedNote: newSelected })
      }
    }
  }

  selectNoteAbove = () => {
    const { selectedNote, descendants, currentNote } = this.props

    if (selectedNote) {
      const tAbove = noteAbove(selectedNote, descendants)
      let newSelected: Note | null = null
      if (tAbove) {
        const lastDesc = lastDescendantOrSelf(tAbove, descendants)
        newSelected = lastDesc ? lastDesc : tAbove
      } else {
        const parent = getParent(selectedNote, descendants)
        if (parent && !sameNote(parent as Note, currentNote)) {
          newSelected = parent
        }
      }
      if (newSelected) {
        this.props.setUserNotePageState({ selectedNote: newSelected })
      }
    }
  }

  moveNoteAbove = () => {
    const { selectedNote } = this.props
    let { descendants } = this.props

    if (selectedNote && selectedNote.position > 1) {
      // Move selectedNote up (decrease position by 1)
      let found = false
      descendants = descendants.map((descendant) => {
        if (!found && areSibling(descendant, selectedNote)) {
          if ((selectedNote.position - 1) === descendant.position) {
            descendant.position += 1
            selectedNote.position -= 1
            found = true
          }
        }
        return (descendant)
      })
      this.props.setUserNotePageState({ descendants: descendants, selectedNote: selectedNote })
      updateBackendNote(selectedNote, this.props.setAppState)
    }
  }

  onKeyDown(event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { note, selectedNote, isReference } = this.props
    let { descendants } = this.props

    if (selectedNote) {
      const textAreaRef = this.textAreaRef

      switch (event.key) {
        case "Enter":
          if (isReference) {
            updateBackendNote(selectedNote, this.props.setAppState)
            this.props.setUserNotePageState({ selectedNote: null })
          } else {
            const newPosition = selectedNote.position + 1

            descendants = descendants.map((descendant) => {
              if (areSibling(descendant, note) && descendant.position >= newPosition) {
                descendant.position += 1
              }
              return (descendant)
            })
            const newNonSavedNote = newNoteWithDescendants({
              position: newPosition,
              user_id: selectedNote.user_id,
              ancestry: selectedNote.ancestry
            })
            descendants.push(newNonSavedNote)
            updateBackendNote(selectedNote, this.props.setAppState)

            this.props.setUserNotePageState({ selectedNote: newNonSavedNote, descendants: descendants })
            createBackendNote({ note: newNonSavedNote, setAppState: this.props.setAppState })
              .then(noteWithId => {
                const selected = this.props.selectedNote
                let newSelected
                if (selected && (selected.tmp_key === noteWithId.tmp_key)) {
                  noteWithId.content = selected.content
                  newSelected = noteWithId
                } else {
                  newSelected = selected
                }

                this.props.setUserNotePageState({
                  descendants: descendants.map((d) => d.tmp_key === noteWithId.tmp_key ? noteWithId : d),
                  selectedNote: newSelected
                })
              })
            event.preventDefault()
          }
          break
        case "Escape":
          updateBackendNote(selectedNote, this.props.setAppState)
          this.props.setUserNotePageState({ selectedNote: null })
          break
        case "Tab":
          if (!isReference) {
            event.shiftKey ? this.unindentNote() : this.indentNote()
          }
          event.preventDefault()
          break
        case "ArrowDown":
          if (!isReference && event.shiftKey && (event.ctrlKey || event.metaKey)) {
            this.moveNoteBelow()
          } else if (textAreaRef && textAreaRef.getCaretPosition() === selectedNote.content.length) {
            this.selectNoteBelow()
          } // Otherwise, do nothing here (move caret one row below within the same note)
          break
        case "ArrowUp":
          if (!isReference && event.shiftKey && (event.ctrlKey || event.metaKey)) {
            this.moveNoteAbove()
          } else if (textAreaRef && textAreaRef.getCaretPosition() === 0) {
            this.selectNoteAbove()
          } // Otherwise, do nothing here (move caret one row above within the same note)
          break
        case "Backspace":
          if (!isReference && selectedNote.content === "") {
            let selectedNoteIndex: number | undefined = undefined
            let siblingAbove: Note | null = null
            let newSelected: Note | null = null

            if (getChildren(selectedNote, descendants).length > 0) {
              // Do nothing when notes have descendants
              return
            }

            descendants = descendants.map((descendant, index) => {
              if (sameNote(selectedNote, descendant)) {
                selectedNoteIndex = index
              } else if (areSibling(descendant, selectedNote)) {
                if (descendant.position === selectedNote.position - 1) {
                  siblingAbove = descendant
                }
                if (descendant.position > selectedNote.position) {
                  descendant.position -= 1
                }
              }
              return (descendant)
            })

            if (siblingAbove) {
              const ch = getChildren(siblingAbove, descendants)
              if (ch.length > 0) {
                // Select the last child of the siblingAbove
                newSelected = ch[ch.length - 1]
              } else {
                // Otherwise, select the siblingAbove
                newSelected = siblingAbove
              }
            } else if (selectedNote.position === 1) {
              // Select parent if this parent is not currentNote
              const parent = getParent(selectedNote, descendants)
              const { currentNote } = this.props
              if (parent && !sameNote(parent, currentNote)) {
                newSelected = parent
              } else {
                return // Do nothing when selectedNote is the only descendant of currentNote
              }
            }

            if (newSelected && selectedNoteIndex !== undefined) {
              // delete selectedNote from descendants:
              descendants.splice(selectedNoteIndex, 1)
              deleteBackendNote(selectedNote, this.props.setAppState)
              this.props.setUserNotePageState({ descendants: descendants, selectedNote: newSelected })
            }
            event.preventDefault()
          }
          break
      }
    }
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target
    auto_grow(event.target)
    const value = target.value
    let { selectedNote } = this.props
    if (selectedNote) {
      selectedNote.content = value
      this.props.setUserNotePageState({ selectedNote: selectedNote })
    }
  }

  renderSelectedNote = (note: Note) => {
    const { currentUser, setAppState } = this.props

    return (
      <ReactTextareaAutocomplete
        ref={(textAreaRef) => { this.textAreaRef = textAreaRef; }}
        onFocus={(e) => auto_grow(e.target)}
        onChange={this.handleChange as any} autoFocus
        onKeyDown={this.onKeyDown}
        name={`note_${note.id}`}
        value={note.content}
        loadingComponent={() => <span>Loading</span>}
        dropdownClassName="editNoteDropDown"
        itemClassName="editNoteItem"
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
    )
  }

  renderLink = (element: string, index: number, include_hashtag: boolean) => {
    const { currentBlogger } = this.props
    const otherUserLink = element.match(/^([^\s:]+):(.*)/)
    let path: string
    if (otherUserLink) {
      path = `/${otherUserLink[1]}/${parameterize(otherUserLink[2], 100)}`
    } else {
      path = `/${currentBlogger.username}/${parameterize(element, 100)}`
    }
    const e = include_hashtag ? `#${element}` : element
    return (
      <Link
        to={path}
        key={index}
        onClick={(event) => {
          window.location.href = path
          event.stopPropagation()
        }}
      >{e}</Link>
    )
  }

  renderUnselectedNote = (note: Note) => {
    const arr = note.content.split(this.NOTES_LINK_REGEX)

    return (
      <>
        {arr.map((element, index) => {
          const n = index % 4
          if (element === undefined) {
            return (<span key={index}></span>)
          } else if (n === 0) {
            return (<StringWithHtmlLinks element={element} key={index} />)
          } else if (n === 1) {
            return (this.renderLink(element, index, false))
          } else {
            // n === 2 || n === 3
            if (element === "") {
              return (n === 3 ? "#" : "")
            } else {
              return (this.renderLink(element, index, true))
            }
          }
        })}
      </>
    )
  }

  selectNote = (note: Note, event: React.MouseEvent<HTMLElement>) => {
    const { selectedNote, currentBlogger, currentUser } = this.props
    const isOwnBlog = currentUser && currentUser.id === currentBlogger.id

    if (event.altKey) {
      window.location.href = `/${currentBlogger.username}/${note.slug}`
    } else if (isOwnBlog) {
      // Update previously selected note:
      if (selectedNote) {
        updateBackendNote(selectedNote, this.props.setAppState)
      }

      // Select new note:
      this.props.setUserNotePageState({ selectedNote: note })
    }
  }

  clickOnNote = (event: React.MouseEvent<HTMLElement>, note: Note, isSelected: boolean | null) => {
    const { isReference, currentBlogger, rootNote } = this.props

    if (!isSelected) {
      if (isReference) {
        const slug = rootNote?.slug || note.slug
        window.location.href = `/${currentBlogger.username}/${slug}`
      } else {
        this.selectNote(note, event)
      }
    }
  }

  public render () {
    const { show_list, selectedNote, note, renderSubnotes, descendants, currentBlogger, currentUser, currentNote } = this.props
    const isSelected = selectedNote && (selectedNote.id === note.id && selectedNote.tmp_key === note.tmp_key)
    const children = getChildren(note, descendants)

    return (
      <>
        {show_list &&
          <li key={noteKey(note)} onClick={(event) => this.clickOnNote(event, note, isSelected)}>
            {isSelected && this.renderSelectedNote(note)}
            {!isSelected && this.renderUnselectedNote(note)}
          </li>
        }
        {!show_list &&
          <div key={noteKey(note)} onClick={(event) => this.clickOnNote(event, note, isSelected)}>
            {isSelected && this.renderSelectedNote(note)}
            {!isSelected && this.renderUnselectedNote(note)}
          </div>
        }
        {renderSubnotes && children && children.length > 0 &&
          <li className="hide-bullet">
            <ul>
              {children.map((subNote) => (
                <NoteRenderer
                  currentBlogger={currentBlogger}
                  currentUser={currentUser}
                  key={"sub" + noteKey(subNote)}
                  note={subNote}
                  rootNote={this.props.rootNote}
                  descendants={descendants}
                  siblings={children}
                  currentNote={currentNote}
                  renderSubnotes={true}
                  selectedNote={selectedNote}
                  setUserNotePageState={this.props.setUserNotePageState}
                  setAppState={this.props.setAppState}
                  isReference={this.props.isReference}
                  show_list={true} />
              ))}
            </ul>
          </li>
        }
      </>
    )
  }
}

export default NoteRenderer
