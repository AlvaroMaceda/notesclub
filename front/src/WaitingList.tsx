import * as React from 'react'
import { Form, Button } from 'react-bootstrap'
import axios from 'axios'
import { apiDomain } from './appConfig'
import './WaitingList.scss'
import { backendErrorsToMessage } from './backendSync'
import { recaptchaRef, recaptchaEnabled } from './utils/recaptcha'
import { Link } from 'react-router-dom'

interface WaitingListProps {
  setAppState: Function
}

interface WaitingListState {
  email: string
}

class WaitingList extends React.Component<WaitingListProps, WaitingListState> {
  constructor(props: WaitingListProps) {
    super(props)

    this.state = {
      email: ""
    }
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target
    const value = target.value
    const name = target.name

    this.setState((prevState) => ({
      ...prevState,
      [name]: value
    }))
  }


  submit = async () => {
    const current = recaptchaRef.current
    const token = recaptchaEnabled && current ? await current.executeAsync() : ""

    const { email } = this.state
    const args = {
      email: email,
      "g-recaptcha-response": token
    }
    axios.post(apiDomain() + "/v1/waiting_users", args, { headers: { 'Content-Type': 'application/json', "Accept": "application/json" }, withCredentials: true })
      .then(res => {
        this.setState({ email: "" })
        this.props.setAppState({ alert: { message: "Saved. We send access codes every week. See you soon!", variant: "success" } })
      })
      .catch(res => {
        if (res.response.status === 401) {
          this.props.setAppState({ alert: { message: "Error. Are you human? If so, please refresh and try again.", variant: "danger" } })
        } else {
          const message = backendErrorsToMessage(res)
          this.props.setAppState({ alert: { message: message, variant: "danger" } })
        }
      })
  }

  public render() {
    const { email } = this.state

    return (
      <div className="container">
        <div className="text-center waiting-list-title">
          <h1>Are you a book reader?</h1>
          <div>Would you like to create <b>open notes</b> about your favorite books?</div>
        </div>
        <div className="row">
          <div className="col-lg-4"></div>
          <div className="col-lg-4">
            <Form.Group>
              <Form.Label>Leave your <b>email</b> & get access soon:</Form.Label>
              <Form.Control
                type="text"
                value={email}
                name="email"
                placeholder="your@email.com"
                onChange={this.handleChange as any} autoFocus />
            </Form.Group>

            <Button onClick={this.submit}>Join</Button>
            {" or "}
            <Link to="/signup" onClick={() => window.location.href = `/signup`}>Sign up</Link> if you have an access code.
          </div>
          <div className="col-lg-4"></div>
        </div>
      </div>
    )
  }
}

export default WaitingList
