# frozen_string_literal: true

APISchemas["v1/notes.yaml"][:note] = {
  description: "Note with user and descendants",
  type: "object",
  allOf: [
    { "$ref": "#/components/schemas/note_basic" },
  ],
  properties: {
    descendants: { "$ref": "#/components/schemas/note_descendants" },
    user: { "$ref": "#/components/schemas/user" }
  }
}
