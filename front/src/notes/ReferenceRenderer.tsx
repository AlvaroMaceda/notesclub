import * as React from 'react'
import { Link } from 'react-router-dom'
import { Note, Reference, noteKey, sameNote } from './Note'
import { User } from './../User'
import { getChildren } from './ancestry'
import NoteRenderer from './NoteRenderer'
import '../Reference.scss'

interface ReferenceRendererProps {
  note: Reference
  selectedNote: Note | null
  setUserNotePageState: Function
  setAppState: Function
  currentUser?: User | null
  showUser: boolean
}

interface ReferenceRendererState {

}

class ReferenceRenderer extends React.Component<ReferenceRendererProps, ReferenceRendererState> {
  constructor(props: ReferenceRendererProps) {
    super(props)

    this.state = {
    }
  }

  renderElement = (note: Note | Reference, user: User, showUser: boolean) => {
    const user_path = `/${user.username}`
    const path = `${user_path}/${note.slug}`
    const content = note.content.replace(/\[\[|\]\]/g, '')

    return (
      <>
        { showUser &&
          <>
            <div className="avatar-div">
              <img src={user.avatar_url} alt="avatar" className="avatar-img" />
            </div>
            <div className="reference-username">
              <b><Link to={user_path} onClick={() => window.location.href = user_path}>{user.name || user.username}</Link></b>
              { " " }
              <Link to={user_path} onClick={() => window.location.href = user_path}>@{user.username}</Link>
            </div>
          </>
        }
        <div className="reference-content">
          {content.split("\n").map((c, index) => {
            return (
              <p className="reference-line" key={index}>
                <Link to={path} onClick={() => window.location.href = path}>{c}</Link>
              </p>
            )
          })}
        </div>
      </>
    )
  }

  renderDescendants = (note: Reference, children: Note[]) => {
    return (
      <div className="reference-content">
        <ul>
          {children.map((subNote) => (
            <NoteRenderer
              currentBlogger={note.user}
              key={"sub" + noteKey(subNote)}
              note={subNote}
              descendants={note.descendants}
              siblings={children}
              currentNote={note}
              renderSubnotes={true}
              selectedNote={this.props.selectedNote}
              setUserNotePageState={this.props.setUserNotePageState}
              setAppState={this.props.setAppState}
              currentUser={this.props.currentUser}
              isReference={true} />
          ))}
        </ul>
      </div>
    )
  }

  renderParentWithDescendants = (note: Reference, parent: Note) => {
    let descendantsAndNote = note.descendants
    descendantsAndNote = descendantsAndNote.concat(note)

    return (
      <div className="reference-content">
        <ul>
          <NoteRenderer
            currentBlogger={note.user}
            note={note}
            descendants={descendantsAndNote}
            siblings={[note]}
            currentNote={parent}
            renderSubnotes={true}
            selectedNote={this.props.selectedNote}
            setUserNotePageState={this.props.setUserNotePageState}
            setAppState={this.props.setAppState}
            currentUser={this.props.currentUser}
            isReference={true} />
        </ul>
      </div>
    )
  }

  public render () {
    const { note, showUser } = this.props
    const ancestors = note.ancestors

    let second_line: Note[]
    let first_element: Note
    let parent: Note

    if (ancestors.length > 0) {
      parent = ancestors[ancestors.length - 1]
      first_element = ancestors[0]
      second_line = ancestors.slice(1, ancestors.length)
    } else {
      parent = note
      first_element = note
      second_line = []
    }
    const second_line_count = second_line.length
    let children = getChildren(note as Note, note.descendants)
    if (children && children.length > 0) {
      const lastChild = children[children.length - 1]
      if (lastChild && lastChild.content === "") {
        children.pop()
      }
    }
    return (
      <>
        {second_line_count > 0 &&
          <div key={`ref_${first_element.id}`} className="reference">
            {this.renderElement(first_element, note.user, showUser)}
            <p>
              {second_line.map((ancestor, index) => {
                return (
                  <span key={ancestor.id}>
                    {this.renderElement(ancestor, note.user, false)}
                    {index < second_line_count - 1 ? ' > ' : ''}
                  </span>
                )
              })}
            </p>
            {this.renderParentWithDescendants(note, parent)}
          </div>
        }

        {second_line_count === 0 && first_element.id === note.id &&
          <div key={`ref_${first_element.id}`} className="reference">
            {this.renderElement(first_element, note.user, showUser)}

            {this.renderDescendants(note, children)}
          </div>
        }

        {second_line_count === 0 && !sameNote(first_element, note) &&
          <div key={`ref_${first_element.id}`} className="reference">
            {this.renderElement(first_element, note.user, true)}
            {this.renderParentWithDescendants(note, parent)}
          </div>
        }
      </>
    )
  }
}

export default ReferenceRenderer
