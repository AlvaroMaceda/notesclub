import * as React from 'react'
import { User } from './User'
import { Note } from './notes/Note'
import Autosuggest from 'react-autosuggest'
import axios from 'axios'
import { apiDomain } from './appConfig'

interface SearchProps {
  currentUser: User
}

interface SearchState {
  value: string
  suggestions: Note[]
  suggestionsDate: Date | null
}


const renderSuggestion = (note: Note) => (
  <div>
    {note.content}
  </div>
)

class Search extends React.Component<SearchProps, SearchState> {
  constructor(props: SearchProps) {
    super(props)

    this.state = {
      value: '',
      suggestions: [],
      suggestionsDate: null
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

  getSuggestionValue = (note: Note) => {
    return (note.content)
  }

  fetchSuggestions = async (value: string) => {
    const inputValue = value.trim().toLowerCase()
    if (inputValue.length > 1) {
      const startTime = new Date() // get time before making request so we only save results if there are no more recent versions.
      const encodedValue = encodeURIComponent(inputValue)
      const args = {
        content_like: `%${encodedValue}%`,
        limit: 15
      }
      const response = await axios.get(
        apiDomain() + '/v1/notes',
        { 
          params: args,
          headers: { 'Content-Type': 'application/json', "Accept": "application/json" }, 
          withCredentials: true 
        }
      ) 
      const { suggestionsDate } = this.state
      if (suggestionsDate === null || suggestionsDate < startTime) {
        const notes: Note[] = response.data
        this.setState({ suggestions: notes, suggestionsDate: startTime })
      }
    }
  }


  public render() {
    const { suggestions, value } = this.state
    
    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={{
          placeholder: 'e.g. Foundation by Isaac Asimov',
          value: value,
          className: 'form-control',
          onChange: (form, event) => {
            this.setState({ value: event.newValue })
          }
        }}
      />
    )
  }

}

export default Search