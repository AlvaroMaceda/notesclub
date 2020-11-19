# frozen_string_literal: true

APISchemas["v1/notes.yaml"][:note_basic] = {
  description: "Basic Note data",
  # It can't have additionalProperties: false because this schema is extended
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
      description:
        "Id of the note's parents separated by '/'. For example: " \
        "'46/51/52/53' where 53 would be the parent, 52 the grandparent, etc.",
      type: "string",
      nullable: true
    },
    created_at: {
      description: "Creation date and time",
      type: "string",
      format: "date-time" # "2020-10-23T16:35:29.977Z",
    },
    updated_at: {
      description: "Last modification date and time",
      type: "string",
      format: "date-time" # "2020-10-23T16:35:29.977Z",
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
