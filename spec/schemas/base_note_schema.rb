# frozen_string_literal: true

APISchemas["v1/notes.yaml"][:base_note] = {
  base_note: {
    description: "Basic Note data",
    properties: {
      id: {
        description: "Note id",
        type: "integer"
      },
      content: {
        description: "Note content",
        type: "string",
        nullable: true
      },
      user_id: {
        description: "Id of the note's user",
        type: "integer",
        nullable: true
      },
      ancestry: {
        description: "Id of the note's parent",
        type: "integer", # WARNING: IS A STRING IN DB
        nullable: true
      },
      created_at: {
        description: "Creation date and time",
        type: "string" # "2020-10-23T16:35:29.977Z",
      },
      updated_at: {
        description: "Last modification date and time",
        type: "string" # "2020-10-23T16:35:29.977Z",
      },
      slug: {
        description: "Slug of the note",
        type: "string"
      },
      position: {
        description: "Note's position respect to its siblings, if any. Starts at 1. For root notes its value is 1",
        type: "integer",
        nullable: true
      }
    },
    required: %w[id content user_id ancestry created_at updated_at slug position]
  }
}
