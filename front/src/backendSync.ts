
import axios from 'axios'
import { User } from './User'
import { apiDomain } from './appConfig'
import { Note, NoteWithFamily } from './notes/Note'

export const fetchBackendUsers = async (ids: number[]) : Promise<User[]> => {
  const response = await axios.get(apiDomain() + '/v1/users', { params: { ids: ids }, headers: { 'Content-Type': 'application/json', "Accept": "application/json" }, withCredentials: true })
    .then(res => res.data)
    .catch(_ => {
      return (Promise.reject("Error"))
    })
  return (response)
}

export const fetchAuthenticatedUser = async (): Promise<User> => {
  const response = await axios.get(apiDomain() + '/v1/users/me', { headers: { 'Content-Type': 'application/json', "Accept": "application/json" }, withCredentials: true })
    .then(res => res.data)
    .catch(res => {
      return (Promise.reject(res))
    })
  return (response)
}

export const fetchBackendUser = async (username: string): Promise<User> => {
  const response = await axios.get(apiDomain() + '/v1/users', { params: { username: username }, headers: { 'Content-Type': 'application/json', "Accept": "application/json" }, withCredentials: true })
    .then(res => res.data[0])
    .catch(_ => {
      return (Promise.reject("Error"))
    })
  return (response)
}

interface fetchBackendNotesInterface {
  content?: string
  reference?: string // This is used to fetch notes with content which contains reference or [[reference]]
  slug?: string
  user_ids?: number[]
  ids?: number[]
  ancestry?: string | null
  include_descendants?: boolean
  include_user?: boolean
  include_ancestors?: boolean
  content_like?: string
  except_ids?: number[]
  tmp_key?: string
  skip_if_no_descendants?: boolean
  except_slug?: string
  id_lte?: number
  created_at_lt?: string
  limit?: number
}

export const fetchBackendNotes = async (params: fetchBackendNotesInterface, setAppState?: Function): Promise<NoteWithFamily[]> => {
  if (params.ancestry === null) { params.ancestry = "" } // Axios skips null and undefined parameters
  const response = await axios.get(apiDomain() + '/v1/notes', { params: params, headers: { 'Content-Type': 'application/json', "Accept": "application/json" }, withCredentials: true })
    .then(res => Promise.resolve(res.data))
    .catch(_ => setAppState ? syncError(setAppState) : null)
  return (response)
}

interface createBackendNote {
  note: Note
  setAppState: Function
  include_ancestors?: boolean
  include_descendants?: boolean
}

export const createBackendNote = async (params: createBackendNote): Promise<NoteWithFamily> => {
  const position = params["note"].position === -1 ? null : params["note"].position
  const args = {
    note: { ...params["note"], ...{ position: position } },
    include_ancestors: params["include_ancestors"],
    include_descendants: params["include_descendants"]
  }

  return (
    axios.post(apiDomain() + '/v1/notes', args, { headers: { 'Content-Type': 'application/json', "Accept": "application/json" }, withCredentials: true })
      .then(res => {
        let t = res.data
        t["tmp_key"] = params["note"].tmp_key
        return (t)
      })
      .catch(_ => syncError(params["setAppState"]))
  )
}

export const updateBackendNote = async (note: Note, setAppState: Function, update_notes_with_links?: boolean): Promise<Note> => {
  let args = {
    note: note,
    update_notes_with_links: update_notes_with_links
  }
  return (
    axios.put(apiDomain() + `/v1/notes/${note.id}`, args, { headers: { 'Content-Type': 'application/json', "Accept": "application/json" }, withCredentials: true })
      .then(res => res.data)
      // .catch(_ => syncError(setAppState))
  )
}

export const deleteBackendNote = async (note: Note, setAppState: Function): Promise<Note> => {
  return (
    axios.delete(apiDomain() + `/v1/notes/${note.id}`, { headers: { 'Content-Type': 'application/json', "Accept": "application/json" }, withCredentials: true })
      .then(res => Promise.resolve(res.data))
  )
}

const syncError = (setAppState: Function) => {
  setAppState({ alert: { variant: "danger", message: "Sync error. Please copy your last change and refresh. Sorry, we're in alpha!" } })
}

export const backendErrorsToMessage = (res: any) => {
  const errors = res.response.data && res.response.data.errors
  let errors_arr: string[] = []
  if (Array.isArray(errors)) {
    errors_arr = errors
  } else {
    for (let key in errors) {
      const capitalized_key = key.charAt(0).toUpperCase() + key.slice(1)
      let value = errors[key].join(`. ${capitalized_key} `)
      errors_arr.push(`${capitalized_key} ${value}`)
    }
  }
  return (errors_arr.join(". "))
}
