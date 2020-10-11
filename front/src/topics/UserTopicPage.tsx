import * as React from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import queryString from 'query-string'
import { Topic, Reference, newTopicWithDescendants, topicKey, newTopic, TopicWithFamily, sameTopic } from './Topic'
import TopicRenderer from './TopicRenderer'
import CurrentTopicContentRenderer from './CurrentTopicContentRenderer'
import { User } from './../User'
import { fetchBackendUser, fetchBackendTopics, createBackendTopic } from './../backendSync'
import { getChildren } from './ancestry'
import { Link } from 'react-router-dom'
import ReferenceRenderer from './ReferenceRenderer'
import LoginOrSignup from '../LoginOrSignup'

interface UserTopicPageProps extends RouteComponentProps<any> {
  setAppState: Function
  currentUser?: User | null
  currentTopicKey: string
  currentBlogUsername: string
}

interface UserTopicPageState {
  currentBlogger?: User | null
  currentTopic?: Topic | null
  selectedTopic: Topic | null
  descendants?: Topic[]
  ancestors?: Topic[]
  references?: Reference[]
  unlinkedReferences?: Reference[]
}

class UserTopicPage extends React.Component<UserTopicPageProps, UserTopicPageState> {
  constructor(props: UserTopicPageProps) {
    super(props)

    this.state = {
      selectedTopic: null
    }
  }

  componentDidMount() {
    const { currentTopicKey, currentUser } = this.props
    if (currentUser && (this.props.currentBlogUsername === 'topic' || this.props.currentBlogUsername === 'user') ){
      // This is used by Wikir's Chrome Extension so it can redirect to a topic without knowing the username
      // We should use history.push or replace, but I couldn't make it work. Although I didn't spend much time.
      const params = queryString.parse(this.props.location.search)
      if (params["content"]) {
        window.location.href = `/${currentUser.username}/${currentTopicKey}?content=${params["content"]}`
      } else {
        window.location.href = `/${currentUser.username}/${currentTopicKey}`
      }
    }
  }

  fetchBloggerAndCurrentTopic = () => {
    const { currentBlogUsername, currentUser, currentTopicKey } = this.props

    fetchBackendUser(currentBlogUsername)
      .then(blogger => {
        this.setState({ currentBlogger: blogger === undefined ? null : blogger})
        if (blogger) {
          fetchBackendTopics({ slug: currentTopicKey, user_ids: [blogger.id], include_descendants: true, include_ancestors: true }, this.props.setAppState)
            .then(fetchBackendTopicsAndDescendants => {
              const isOwnBlog = currentUser ? currentUser.id === blogger.id : false
              if (fetchBackendTopicsAndDescendants.length === 0) {
                // Create topic
                if (isOwnBlog && currentUser) {
                  const params = queryString.parse(this.props.location.search)
                  const newNonSavedTopic = newTopic({
                    slug: currentTopicKey,
                    user_id: currentUser.id,
                    ancestry: null,
                    position: -1, // We'll replace this with null before sending it to the backend so it adds it to the end
                    content: params["content"] ? String(params["content"]) : undefined
                  })
                  const args = { topic: newNonSavedTopic, setAppState: this.props.setAppState, include_ancestors: true, include_descendants: true }
                  createBackendTopic(args)
                    .then(topic => {
                      this.props.history.push(`/${currentUser.username}/${currentTopicKey}`) // get rid of the content argument
                      this.setTopicAndCreateDescendantIfNone(topic, isOwnBlog)
                    })
                } else {
                  this.setState({ currentTopic: null })
                  this.setReferences()
                }
              } else {
                // Topic already exists
                this.setTopicAndCreateDescendantIfNone(fetchBackendTopicsAndDescendants[0], isOwnBlog)
              }
            })
        }
      })
  }

  setTopicAndCreateDescendantIfNone = (topicAndFamily: TopicWithFamily, isOwnBlog: boolean) => {
    this.setState({ currentTopic: topicAndFamily, descendants: topicAndFamily.descendants, ancestors: topicAndFamily.ancestors })
    if (topicAndFamily.descendants) {
      if (isOwnBlog && topicAndFamily.descendants.length === 1) {
        this.setState({ selectedTopic: topicAndFamily.descendants[0] })
      } else if (isOwnBlog && topicAndFamily.descendants.length === 0) {
        this.createDescendantAsThereAreNone()
      }
    }
    this.setReferences()
  }

  setReferences = () => {
    const { currentTopic } = this.state
    const { currentUser, currentTopicKey } = this.props
    const content_like = currentTopic ? currentTopic.content : currentTopicKey

    if (currentUser !== undefined ) {
      fetchBackendTopics(
        {
          include_descendants: true,
          include_ancestors: true,
          include_user: true,
          content_like: `%[[${content_like}]]%`
        },
        this.props.setAppState)
        .then(references => {
          let refs = (references as Reference[]).filter((r) => !this.inCurrentTopic(r))
          if (currentTopic) {
            refs = refs.sort((a, b) => a.user_id === currentTopic.user_id ? -1 : 1)
          }
          if (currentUser) {
            refs = refs.sort((a, b) => a.user_id === currentUser.id ? -1 : 1)
          }
          this.setState({ references: refs })
          this.setUnlinkedReferences()
        })
    }
  }

  inCurrentTopic = (reference: Reference): boolean => {
    const { currentTopic, ancestors } = this.state

    if (ancestors && currentTopic) {
      const refRoot = this.getReferenceRoot(reference, reference.ancestors)
      const currentRoot = this.getReferenceRoot(currentTopic, ancestors)
      return (sameTopic(refRoot, currentRoot))
    } else {
      return (false)
    }
  }

  setUnlinkedReferences = () => {
    const { currentTopic, references } = this.state
    const { currentUser, currentTopicKey } = this.props
    if (currentUser !== undefined && references) {
      const content_like = currentTopic ? currentTopic.content : currentTopicKey
      const except_ids = (references.filter(ref => ref.id).map((ref) => ref.id as number))
      fetchBackendTopics(
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
            .filter(r => !this.inCurrentTopic(r))
          if (currentTopic) {
            unlinkedRef = unlinkedRef.sort((a, b) => a.user_id === currentTopic.user_id ? -1 : 1)
          }
          if (currentUser) {
            unlinkedRef.sort((a, b) => a.user_id === currentUser.id ? -1 : 1)
          }
          this.setState({ unlinkedReferences: unlinkedRef })
        })
    }
  }

  updateState = (partialState: Partial<UserTopicPageState>) => {
    const newState: UserTopicPageState = { ...this.state, ...partialState }
    this.setState(newState)
  }

  createDescendantAsThereAreNone = (): void => {
    const { currentTopic } = this.state
    const { currentUser } = this.props

    if (currentUser && currentTopic) {
      const newNonSavedTopic = newTopicWithDescendants({
        position: 1,
        user_id: currentUser.id,
        ancestry: currentTopic.ancestry ? `${currentTopic.ancestry}/${currentTopic.id}` : String(currentTopic.id)
      })
      const descendants: Topic[] = [newNonSavedTopic]
      createBackendTopic({ topic: newNonSavedTopic, setAppState: this.props.setAppState })
        .then(topicWithId => {
          this.setState({
            descendants: descendants.map((d) => d.tmp_key === topicWithId.tmp_key ? topicWithId : d),
            selectedTopic: topicWithId
          })
        })
    }
  }

  getReferenceRoots = (references: Reference[]): Topic[] => {
    return (references.map(r => this.getReferenceRoot(r as Topic, r.ancestors)))
  }

  getReferenceRoot = (reference: Topic, ancestors: Topic[]): Topic => {
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
    const { currentBlogger, currentTopic, selectedTopic, descendants, ancestors, references, unlinkedReferences } = this.state
    const { currentUser, currentTopicKey } = this.props

    if (currentBlogger === undefined && currentUser !== undefined) {
      this.fetchBloggerAndCurrentTopic()
    }
    const children = currentTopic && descendants ? getChildren(currentTopic, descendants) : undefined

    const ancestor_count = ancestors ? ancestors.length : 0
    const isOwnBlog = currentUser && currentBlogger && currentUser.id === currentBlogger.id
    const linkToOwnPage = !isOwnBlog && references && unlinkedReferences && currentUser && (currentTopic === null || (currentTopic && !references.find((t) => t.slug === currentTopic.slug && t.user_id === currentUser.id) && !unlinkedReferences.find((t) => t.slug === currentTopic.slug && t.user_id === currentUser.id)))
    const currentUsername = currentUser ? currentUser.username : ""
    const ownPagePath = currentTopic ? `/${currentUsername}/${currentTopic.slug}?content=${currentTopic.content}` : `/${currentUsername}/${currentTopicKey}`

    return (
      <>
        <div className="container">
          {currentBlogger && !currentTopic &&
          <h1><a href={`/${currentBlogger.username}`}>{currentBlogger.name}</a></h1>
          }
          {currentBlogger !== null && currentTopic === undefined &&
            <p>Loading</p>
          }
          {currentUser && (currentBlogger === null || (currentTopic === null && linkToOwnPage)) &&
            <>
              <p>No notes on "{currentTopicKey}" yet.</p>
              <p>
                <Link to={ownPagePath} onClick={() => window.location.href = ownPagePath}>Create your note "{currentTopic ? currentTopic.content : currentTopicKey}"</Link>.
              </p>
            </>
          }
          {(!currentUser && (currentBlogger === null || currentTopic === null)) &&
            <p>No notes on "{currentTopicKey}" yet.</p>
          }
          {currentBlogger && currentTopic && children && descendants && ancestors &&
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
                <CurrentTopicContentRenderer
                  descendants={descendants}
                  references={references}
                  currentTopic={currentTopic}
                  selectedTopic={selectedTopic}
                  setUserTopicPageState={this.updateState}
                  setAppState={this.props.setAppState}
                  currentUser={currentUser} />
              </h1>

              <ul>
                {children.map((subTopic) => (
                  <TopicRenderer
                    currentBlogger={currentBlogger}
                    key={"sub" + topicKey(subTopic)}
                    topic={subTopic}
                    descendants={descendants}
                    siblings={children}
                    currentTopic={currentTopic}
                    renderSubtopics={true}
                    selectedTopic={selectedTopic}
                    setUserTopicPageState={this.updateState}
                    setAppState={this.props.setAppState}
                    currentUser={currentUser}
                    isReference={false} />
                ))}
              </ul>
              {linkToOwnPage &&
                <p>
                  <Link to={ownPagePath} onClick={() => window.location.href=ownPagePath}>Create your note "{currentTopic.content}"</Link>.
                </p>
              }
              {references && references.length > 0 &&
                <>
                  References:
                    <ul>
                    {references.map((ref) => (
                      <ReferenceRenderer
                        key={ref.id}
                        topic={ref}
                        selectedTopic={selectedTopic}
                        setUserTopicPageState={this.updateState}
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
                        topic={ref}
                        selectedTopic={selectedTopic}
                        setUserTopicPageState={this.updateState}
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

export default withRouter(UserTopicPage)
