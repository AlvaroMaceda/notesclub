import * as React from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import queryString from 'query-string'
import { Note, Reference, newNoteWithDescendants, noteKey, newNote, NoteWithFamily, sameNote } from './Note'
import NoteRenderer from './NoteRenderer'
import CurrentNoteContentRenderer from './CurrentNoteContentRenderer'
import { User } from './../User'
import { fetchBackendUser, fetchBackendNotes, createBackendNote } from './../backendSync'
import { getChildren } from './ancestry'
import { Link } from 'react-router-dom'
import ReferenceRenderer from './ReferenceRenderer'
import LoginOrSignup from '../LoginOrSignup'

interface UserNotePageProps extends RouteComponentProps<any> {
  setAppState: Function
  currentUser?: User | null
  currentNoteKey: string
  currentBlogUsername: string
}

interface UserNotePageState {
  currentBlogger?: User | null
  currentNote?: Note | null
  selectedNote: Note | null
  descendants?: Note[]
  ancestors?: Note[]
  references?: Reference[]
  unlinkedReferences?: Reference[]
}

class UserNotePage extends React.Component<UserNotePageProps, UserNotePageState> {
  constructor(props: UserNotePageProps) {
    super(props)

    this.state = {
      selectedNote: null
    }
  }

  redirectToUserNote = (username: string) => {
    const { currentNoteKey } = this.props
    // This is used by Wikir's Chrome Extension so it can redirect to a note without knowing the username
    // We should use history.push or replace, but I couldn't make it work. Although I didn't spend much time.
    const params = queryString.parse(this.props.location.search)
    if (params["content"]) {
      window.location.href = `/${username}/${currentNoteKey}?content=${params["content"]}`
    } else {
      window.location.href = `/${username}/${currentNoteKey}`
    }
  }

  fetchBloggerAndCurrentNote = () => {
    const { currentBlogUsername, currentUser, currentNoteKey } = this.props

    fetchBackendUser(currentBlogUsername)
      .then(blogger => {
        this.setState({ currentBlogger: blogger === undefined ? null : blogger})
        if (blogger) {
          fetchBackendNotes({ slug: currentNoteKey, user_ids: [blogger.id], include_descendants: true, include_ancestors: true }, this.props.setAppState)
            .then(fetchBackendNotesAndDescendants => {
              const isOwnBlog = currentUser ? currentUser.id === blogger.id : false
              if (fetchBackendNotesAndDescendants.length === 0) {
                // Create note
                if (isOwnBlog && currentUser) {
                  const params = queryString.parse(this.props.location.search)
                  const newNonSavedNote = newNote({
                    slug: currentNoteKey,
                    user_id: currentUser.id,
                    ancestry: null,
                    position: -1, // We'll replace this with null before sending it to the backend so it adds it to the end
                    content: params["content"] ? String(params["content"]) : undefined
                  })
                  const args = { note: newNonSavedNote, setAppState: this.props.setAppState, include_ancestors: true, include_descendants: true }
                  createBackendNote(args)
                    .then(note => {
                      this.props.history.push(`/${currentUser.username}/${currentNoteKey}`) // get rid of the content argument
                      this.setNoteAndCreateDescendantIfNone(note, isOwnBlog)
                    })
                } else {
                  this.setState({ currentNote: null })
                  this.setReferences()
                }
              } else {
                // Note already exists
                this.setNoteAndCreateDescendantIfNone(fetchBackendNotesAndDescendants[0], isOwnBlog)
              }
            })
        }
      })
  }

  setNoteAndCreateDescendantIfNone = (noteAndFamily: NoteWithFamily, isOwnBlog: boolean) => {
    this.setState({ currentNote: noteAndFamily, descendants: noteAndFamily.descendants, ancestors: noteAndFamily.ancestors })
    if (noteAndFamily.descendants) {
      if (isOwnBlog && noteAndFamily.descendants.length === 1) {
        this.setState({ selectedNote: noteAndFamily.descendants[0] })
      } else if (isOwnBlog && noteAndFamily.descendants.length === 0) {
        this.createDescendantAsThereAreNone()
      }
    }
    this.setReferences()
  }

  setReferences = () => {
    const { currentNote } = this.state
    const { currentUser, currentNoteKey } = this.props
    const content_like = currentNote ? currentNote.content : currentNoteKey

    if (currentUser !== undefined ) {
      fetchBackendNotes(
        {
          include_descendants: true,
          include_ancestors: true,
          include_user: true,
          content_like: `%[[${content_like}]]%`
        },
        this.props.setAppState)
        .then(references => {
          let refs = (references as Reference[]).filter((r) => !this.inCurrentNote(r))
          if (currentNote) {
            refs = refs.sort((a, b) => a.user_id === currentNote.user_id ? -1 : 1)
          }
          if (currentUser) {
            refs = refs.sort((a, b) => a.user_id === currentUser.id ? -1 : 1)
          }
          this.setState({ references: refs })
          this.setUnlinkedReferences()
        })
    }
  }

  inCurrentNote = (reference: Reference): boolean => {
    const { currentNote, ancestors } = this.state

    if (ancestors && currentNote) {
      const refRoot = this.getReferenceRoot(reference, reference.ancestors)
      const currentRoot = this.getReferenceRoot(currentNote, ancestors)
      return (sameNote(refRoot, currentRoot))
    } else {
      return (false)
    }
  }

  setUnlinkedReferences = () => {
    const { currentNote, references } = this.state
    const { currentUser, currentNoteKey } = this.props
    if (currentUser !== undefined && references) {
      const content_like = currentNote ? currentNote.content : currentNoteKey
      const except_ids = (references.filter(ref => ref.id).map((ref) => ref.id as number))
      fetchBackendNotes(
        {
          include_descendants: true,
          include_ancestors: true,
          include_user: true,
          content_like: `${content_like}`,
          except_ids: except_ids
        },
        this.props.setAppState)
        .then(unlinkedReferences => {
          let unlinkedRef = this.uniqueUnlinkedReferences(references, unlinkedReferences as Reference[])
            .filter(r => !this.inCurrentNote(r))
          if (currentNote) {
            unlinkedRef = unlinkedRef.sort((a, b) => a.user_id === currentNote.user_id ? -1 : 1)
          }
          if (currentUser) {
            unlinkedRef.sort((a, b) => a.user_id === currentUser.id ? -1 : 1)
          }
          this.setState({ unlinkedReferences: unlinkedRef })
        })
    }
  }

  updateState = (partialState: Partial<UserNotePageState>) => {
    const newState: UserNotePageState = { ...this.state, ...partialState }
    this.setState(newState)
  }

  createDescendantAsThereAreNone = (): void => {
    const { currentNote } = this.state
    const { currentUser } = this.props

    if (currentUser && currentNote) {
      const newNonSavedNote = newNoteWithDescendants({
        position: 1,
        user_id: currentUser.id,
        ancestry: currentNote.ancestry ? `${currentNote.ancestry}/${currentNote.id}` : String(currentNote.id)
      })
      const descendants: Note[] = [newNonSavedNote]
      createBackendNote({ note: newNonSavedNote, setAppState: this.props.setAppState })
        .then(noteWithId => {
          this.setState({
            descendants: descendants.map((d) => d.tmp_key === noteWithId.tmp_key ? noteWithId : d),
            selectedNote: noteWithId
          })
        })
    }
  }

  getReferenceRoots = (references: Reference[]): Note[] => {
    return (references.map(r => this.getReferenceRoot(r as Note, r.ancestors)))
  }

  getReferenceRoot = (reference: Note, ancestors: Note[]): Note => {
    const root = ancestors.length > 0 ? ancestors[0] : reference
    return (root)
  }

  uniqueUnlinkedReferences = (references: Reference[], unlinkedReferences: Reference[]): Reference[] => {
    const referenceRoots = references ? this.getReferenceRoots(references) || [] : []
    const referenceRootIds = referenceRoots.map(r => r?.id).filter(r => r)
    return (
      (unlinkedReferences || []).filter(r => {
        const root_id = this.getReferenceRoot(r, r.ancestors).id
        return (!referenceRootIds.includes(root_id))
      })
    )
  }

  public render () {
    const { currentBlogger, currentNote, selectedNote, descendants, ancestors, references, unlinkedReferences } = this.state
    const { currentUser, currentNoteKey, currentBlogUsername } = this.props

    if (currentUser && (currentBlogUsername === "notes" || currentBlogUsername === "user" || currentBlogUsername === "note")) {
      this.redirectToUserNote(currentUser.username)
    }
    if (currentBlogger === undefined && currentUser !== undefined) {
      this.fetchBloggerAndCurrentNote()
    }
    const children = currentNote && descendants ? getChildren(currentNote, descendants) : undefined

    const ancestor_count = ancestors ? ancestors.length : 0
    const isOwnBlog = currentUser && currentBlogger && currentUser.id === currentBlogger.id
    const linkToOwnPage = !isOwnBlog && references && unlinkedReferences && currentUser && (currentNote === null || (currentNote && !references.find((t) => t.slug === currentNote.slug && t.user_id === currentUser.id) && !unlinkedReferences.find((t) => t.slug === currentNote.slug && t.user_id === currentUser.id)))
    const currentUsername = currentUser ? currentUser.username : ""
    const ownPagePath = currentNote ? `/${currentUsername}/${currentNote.slug}?content=${currentNote.content}` : `/${currentUsername}/${currentNoteKey}`

    return (
      <>
        <div className="topic-container container">
          {currentBlogger && !currentNote &&
          <h1><a href={`/${currentBlogger.username}`}>{currentBlogger.name}</a></h1>
          }
          {currentBlogger !== null && currentNote === undefined &&
            <p>Loading</p>
          }
          {currentUser && (currentBlogger === null || (currentNote === null && linkToOwnPage)) &&
            <>
              <p>No notes on "{currentNoteKey}" yet.</p>
              <p>
                <Link to={ownPagePath} onClick={() => window.location.href = ownPagePath}>Create your note "{currentNote ? currentNote.content : currentNoteKey}"</Link>.
              </p>
            </>
          }
          {(!currentUser && currentBlogUsername !== "notes" && (currentBlogger === null || currentNote === null)) &&
            <p>No notes on "{currentNoteKey}" yet.</p>
          }
          {currentBlogger && currentNote && children && descendants && ancestors &&
            <>
              {ancestor_count > 0 &&
                <p>
                  {ancestors.map((ancestor, index) => {
                    const path = `/${currentBlogger.username}/${ancestor.slug}`
                    return (
                      <span key={`ancestor_${ancestor.id}`}>
                        <Link
                          to={path}
                          onClick={(event) => {
                            window.location.href = path
                          }}
                        >{ancestor.content}</Link>
                        {(index < ancestor_count - 1) && " > "}
                      </span>
                    )
                  })}
                </p>
              }
              <h1>
                <a href={`/${currentBlogger.username}`}>{currentBlogger.name}</a>
                {" · "}
                <CurrentNoteContentRenderer
                  descendants={descendants}
                  references={references}
                  currentNote={currentNote}
                  selectedNote={selectedNote}
                  setUserNotePageState={this.updateState}
                  setAppState={this.props.setAppState}
                  currentUser={currentUser} />
              </h1>

              <ul>
                {children.map((subNote) => (
                  <NoteRenderer
                    currentBlogger={currentBlogger}
                    key={"sub" + noteKey(subNote)}
                    note={subNote}
                    descendants={descendants}
                    siblings={children}
                    currentNote={currentNote}
                    renderSubnotes={true}
                    selectedNote={selectedNote}
                    setUserNotePageState={this.updateState}
                    setAppState={this.props.setAppState}
                    currentUser={currentUser}
                    isReference={false} />
                ))}
              </ul>
              {linkToOwnPage &&
                <p>
                  <Link to={ownPagePath} onClick={() => window.location.href=ownPagePath}>Create your note "{currentNote.content}"</Link>.
                </p>
              }
              {references && references.length > 0 &&
                <>
                  References:
                    <ul>
                    {references.map((ref) => (
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
              {unlinkedReferences && unlinkedReferences.length > 0 &&
                <>
                  Related:
                    <ul>
                    {unlinkedReferences.map((ref) => (
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
            </>
          }

          {currentUser === null &&
            <LoginOrSignup />
          }
        </div>
      </>
    )
  }
}

export default withRouter(UserNotePage)
