import { Note, sameNote, sortNotes } from './Note'

export const getChildren = (note: Note, descendants: Note[]): Note[] => {
  return (
    sortNotes(
      descendants.filter((descendant) => {
        if (note.ancestry === null) {
          return (descendant.ancestry === String(note.id))
        } else {
          return (descendant.ancestry === `${note.ancestry}/${note.id}`)
        }
      })
    )
  )
}

export const areSibling = (t1: Note, t2: Note): boolean => {
  return (!sameNote(t1, t2) && t1.ancestry === t2.ancestry)
}

export const getParent = (note: Note, descendants: Note[]): Note | null => {
  if (note.ancestry === null) {
    return (null)
  } else {
    const ancestor_ids = note.ancestry.split("/")
    const parent_id = ancestor_ids[ancestor_ids.length - 1]
    const parent_arr = descendants.filter((descendant) => descendant.id === Number(parent_id))
    return (parent_arr.length === 1 ? parent_arr[0] : null)
  }
}

export const getRootId = (note: Note): number | undefined => {
  if (note.ancestry === null) {
    return (note.id)
  } else {
    return (Number(note.ancestry.split("/")[0]))
  }
}
