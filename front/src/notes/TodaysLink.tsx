import * as React from 'react'
import { User } from './../User'
import { Link } from 'react-router-dom'
import { todaysSlug } from './../utils/todaysSlug'

interface TodaysLinkProps {
  currentUser: User
}

interface TodaysLinkState {

}

class TodaysLink extends React.Component<TodaysLinkProps, TodaysLinkState> {
  constructor(props: TodaysLinkProps) {
    super(props)

    this.state = {
    }
  }

  public render () {
    const { currentUser } = this.props
    const todayNoteContent = todaysSlug()
    const todayNoteUrl = currentUser ? `/${currentUser.username}/${todayNoteContent}` : ""

    return (
      <>
        {"Not sure where to start? "}
        <Link to={todayNoteUrl} onClick={() => window.location.href = todayNoteUrl}>{todayNoteContent}</Link> is a great place to add notes.
      </>
    )
  }
}

export default TodaysLink
