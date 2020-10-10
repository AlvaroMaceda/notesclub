import * as React from 'react'
import { User } from './User'
import { Form, Button } from 'react-bootstrap'
import { parameterize } from './utils/parameterize'
import Autosuggest from 'react-autosuggest'
import './NewBookPage.scss';
import axios from 'axios'

interface NewBookPageProps {
  setAppState: Function
  currentUser: User
}

interface NewBookPageState {
  value: string
  newTopicAuthor: string
  suggestions: Book[]
}

interface Book {
  title_suggest: string
  author_name: string
}

const books0 = [
  {
    title_suggest: 'Sapiens',
    author_name: 'Harari'
  },
  {
    title_suggest: 'Saaaaa',
    author_name: 'whatever'
  },
  {
    title_suggest: 'Foundation',
    author_name: 'Asimov'
  }
]

const renderSuggestion = (suggestion: Book) => (
  <div>
    {`${suggestion.title_suggest} by ${suggestion.author_name}`}
  </div>
)

class NewBookPage extends React.Component<NewBookPageProps, NewBookPageState> {
  constructor(props: NewBookPageProps) {
    super(props)

    this.state = {
      value: '',
      newTopicAuthor: "",
      suggestions: []
    }
  }

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = (params: any) => {
    this.fetchSuggestions(params.value)
  }

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    })
  }

  getSuggestionValue = (suggestion: Book) => {
    return (`${suggestion.title_suggest} by ${suggestion.author_name}`)
  }

  fetchSuggestions = async (value: string) => {
    const inputValue = value.trim().toLowerCase()
    if (inputValue.length > 1) {
      const encodedValue = encodeURIComponent(inputValue)
      const response = await axios.get(`https://openlibrary.org/search.json?q=${encodedValue}&limit=10`)
      this.setState({
        suggestions: response.data.docs
      })
    }
  }


  public render() {
    const { currentUser } = this.props
    const { value, newTopicAuthor, suggestions } = this.state

    return (
      <div className="container">
        <div className="row">
          <div className="col-lg-3"></div>
          <div className="col-lg-6">
            <h1>Add book notes</h1>

            Title
            <Autosuggest
              suggestions={suggestions}
              onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
              onSuggestionsClearRequested={this.onSuggestionsClearRequested}
              getSuggestionValue={this.getSuggestionValue}
              renderSuggestion={renderSuggestion}
              inputProps={{
                placeholder: 'Type a book title',
                value,
                onChange: (form, event) => {
                  this.setState({ value: event.newValue })
                }
              }}
            />
          </div>
          <div className="col-lg-3"></div>
        </div>
      </div>
    )
  }
}

export default NewBookPage
