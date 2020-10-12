import { areSibling, getParent, getChildren } from './ancestry'
import { User } from './../User'

export interface Note {
  id?: number
  slug?: string
  content: string
  ancestry: string | null
  position: number
  user_id: number
  tmp_key?: string // Used for react keys when there is no id
}

export interface NoteWithFamily extends Note {
  descendants?: Note[]
  ancestors?: Note[]
  user?: User
}

export interface Reference extends Note {
  descendants: Note[]
  ancestors: Note[]
  user: User
}

export interface NoteWithDescendants extends Note {
  descendants: Note[]
}

export const noteKey = (note: Note): string => {
  return (note.tmp_key ? `note_${note.tmp_key}` : `note_id_${note.id}`)
}

export const sameNote = (t1: Note, t2: Note): boolean => {
  return ((t1.id === t2.id) || (t1.tmp_key === t2.tmp_key && t1.tmp_key !== undefined && t1.tmp_key !== ""))
}

export const sortNotes = (notes: Note[]): Note[] => {
  return (notes.sort((a, b) => a.position > b.position ? 1 : -1))
}

export const sortNotesAndReverse = (notes: Note[]): Note[] => {
  return (notes.sort((a, b) => a.position < b.position ? 1 : -1))
}

export const noteBelow = (note: Note, descendants: Note[]): Note | null => {
  return (descendants.find((descendant) => areSibling(descendant, note) && descendant.position === note.position + 1) || null)
}

export const noteAbove = (note: Note, descendants: Note[]): Note | null => {
  return (descendants.find((descendant) => areSibling(descendant, note) && descendant.position === note.position - 1) || null)
}

export const lastDescendantOrSelf = (note: Note, descendants: Note[]): Note | null => {
  const children = getChildren(note, descendants)
  if (children.length === 0) {
    return (note)
  } else {
    return (lastDescendantOrSelf(children[children.length - 1], descendants))
  }
}

export const noteOrAncestorBelow = (note: Note, descendants: Note[]): Note | null => {
  const siblingBelow = noteBelow(note, descendants)
  if (siblingBelow) {
    return (siblingBelow)
  } else {
    const parent = getParent(note, descendants)
    if (parent === null || parent.ancestry === null) {
      return (null)
    } else {
      return (noteOrAncestorBelow(parent, descendants))
    }
  }
}

interface newNoteInterface {
  content?: string
  slug?: string
  position: number
  user_id: number
  ancestry: string | null
  descendants?: Note[]
}

export const newNote = (args: newNoteInterface): Note => {
  return (
    {
      content: args.content || "",
      slug: args.slug,
      position: args.position,
      user_id: args.user_id,
      ancestry: args.ancestry,
      tmp_key: Math.random().toString(36).substring(2)
    }
  )
}

export const newNoteWithDescendants = (args: newNoteInterface): NoteWithDescendants => {
  return ({ ...newNote(args), ...{ descendants: Array<Note>() } })
}
