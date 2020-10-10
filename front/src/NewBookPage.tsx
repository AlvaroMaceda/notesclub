import * as React from 'react'
import { User } from './User'
import { Form, Button } from 'react-bootstrap'
import { parameterize } from './utils/parameterize'
import Autosuggest from 'react-autosuggest'
import './NewBookPage.scss';

interface NewBookPageProps {
  setAppState: Function
  currentUser: User
}

interface NewBookPageState {
  value: string
  newTopicAuthor: string
  suggestions: Language[]
}

interface Language {
  name: string
  year: number
}

// Imagine you have a list of languages that you'd like to autosuggest.
const languages = [
  {
    name: 'Sapiens',
    year: 1972
  },
  {
    name: 'Saaaaa',
    year: 2012
  },
  {
    name: 'Foundation',
    year: 2012
  }
]

const renderSuggestion = (suggestion: Language) => (
  <div>
    {suggestion.name}
  </div>
)

// Teach Autosuggest how to calculate suggestions for any given input value.
const getSuggestions = (value: string) => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  return inputLength === 0 ? [] : languages.filter(lang =>
    lang.name.toLowerCase().slice(0, inputLength) === inputValue
  )
}


class NewBookPage extends React.Component<NewBookPageProps, NewBookPageState> {
  constructor(props: NewBookPageProps) {
    super(props)

    this.state = {
      value: '',
      newTopicAuthor: "",
      suggestions: []
    }
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target
    const name = target.name
    const value = target.value
    this.setState((prevState) => ({
      ...prevState,
      [name]: value
    }))
  }


  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = (params: any) => {
    this.setState({
      suggestions: getSuggestions(params.value)
    })
  }

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    })
  }

  getSuggestionValue = (suggestion: Language) => {
    console.log(suggestion)
    return (suggestion.name)
  }

  public render() {
    const { currentUser } = this.props
    const { value, newTopicAuthor, suggestions } = this.state

    return (
      <div className="container">
        <div className="row">
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
          <div className="col-lg-6"></div>
        </div>
      </div>
    )
  }
}

export default NewBookPage
