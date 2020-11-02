import * as React from 'react'
import { User } from './../User'
import { Link } from 'react-router-dom'

interface TodaysLinkProps {
  currentUser: User
}

interface TodaysLinkState {

}

const pad = (number: number) => {
  if (number < 10) {
    return '0' + number
  }

  return number
}

class TodaysLink extends React.Component<TodaysLinkProps, TodaysLinkState> {
  constructor(props: TodaysLinkProps) {
    super(props)

    this.state = {
    }
  }

  public render () {
    const { currentUser } = this.props
    const today = new Date()
    const year = today.getUTCFullYear()
    const month = pad(today.getUTCMonth() + 1)
    const day = pad(today.getUTCDate())
    const todayNoteContent = `${year}-${month}-${day}`
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
