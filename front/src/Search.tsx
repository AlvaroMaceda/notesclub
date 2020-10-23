import * as React from 'react'
import { User } from './User'
import { NoteWithFamily } from './notes/Note'
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
  suggestions: NoteWithFamily[]
}

const THROTTLE_TIME = 500
const MINIMUM_SEARCH_LENGTH = 2

const renderSuggestion = (note: NoteWithFamily) => (
  <div>
    {note.content}
  </div>
)

const hasEnoughLength = (value: string) => value.length >= MINIMUM_SEARCH_LENGTH

class Search extends React.Component<SearchProps, SearchState> {

  lookups: Subject<string>

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

  getSuggestionValue = (note: NoteWithFamily) => {
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

  calculationResponse(response: AxiosResponse<NoteWithFamily[]>) {
    this.setState({ suggestions: response.data })
  }

  async launchLookUpRequest(value: string) {
    const encodedValue = encodeURIComponent(value)
    const args = {
      content_like: `%${encodedValue}%`,
      limit: 15,
      include_user: true
    }
    return axios.get<NoteWithFamily[]>(
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
        onSuggestionSelected={(_, { suggestion }) => {
          const username = suggestion.user?.username || ''
          window.location.href = `/${username}/${suggestion.slug}`
        }}
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={{
          placeholder: 'Search',
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