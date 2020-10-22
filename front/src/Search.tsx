import * as React from 'react'
import { User } from './User'
import { Note } from './notes/Note'
import Autosuggest, {SuggestionsFetchRequestedParams}  from 'react-autosuggest'
import axios, {AxiosResponse, AxiosError} from 'axios';
import { apiDomain } from './appConfig'
import { Subject, asyncScheduler } from 'rxjs'
import { switchMap, throttleTime, filter } from 'rxjs/operators'

interface SearchProps {
  currentUser: User
}

interface SearchState {
  value: string
  suggestions: Note[]
}

const THROTTLE_TIME = 500
const MINIMUM_SEARCH_LENGTH = 2

const renderSuggestion = (note: Note) => (
  <div>
    {note.content}
  </div>
)

const hasEnoughLength = (value: string) => value.length >= MINIMUM_SEARCH_LENGTH

class Search extends React.Component<SearchProps, SearchState> {

  lookups: Subject<any>

  constructor(props: SearchProps) {
    super(props)

    this.state = {
      value: '',
      suggestions: [],
    }

    this.lookups = new Subject()
    this.subscribeToLookUps()

  }
  onSuggestionsFetchRequested = (params: SuggestionsFetchRequestedParams) => {
    const inputValue = params.value.trim().toLowerCase()
    if (inputValue.length < MINIMUM_SEARCH_LENGTH) return;    

    this.lookups.next(inputValue)
  }

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    })
  }

  getSuggestionValue = (note: Note) => {
    return (note.content)
  }

  subscribeToLookUps() {
    this.lookups.pipe(
      filter(hasEnoughLength),
      throttleTime(THROTTLE_TIME, asyncScheduler, {trailing:true}), // {trailing: true} is for launching the last request (that's the request we are interested in)    
      switchMap( (value: string) => this.launchLookUpRequest(value) ), // switchMap will ignore all requests except last one
    ).subscribe( 
      (data: AxiosResponse) => this.calculationResponse(data),
      (error: AxiosError) => this.calculationError(error)
    )
  }

  calculationError(error: AxiosError) {
    // TO-DO: show some error message on UI?
    console.log(`Search request has failed: ${error}`);
    // We must resubscribe because the original subscription has errored out and isn't valid anymore
    this.subscribeToLookUps()
  }

  calculationResponse(response: AxiosResponse) {
    const notes: Note[] = response.data
    this.setState({ suggestions: notes })
  }

  async launchLookUpRequest(value: string) {
    const encodedValue = encodeURIComponent(value)
    const args = {
      content_like: `%${encodedValue}%`,
      limit: 15
    }
    return axios.get(
      apiDomain() + '/v1/notes',
      { 
        params: args,
        headers: { 'Content-Type': 'application/json', "Accept": "application/json" }, 
        withCredentials: true 
      }
    )
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