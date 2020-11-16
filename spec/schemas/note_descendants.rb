# frozen_string_literal: true

APISchemas["v1/notes.yaml"][:note_descendants] = {
  description: "Descendants notes of a note",
  # It can't have additionalProperties: false because this schema is extended
  type: "array",
  items: { "$ref": "#/components/schemas/note_basic" }
}
