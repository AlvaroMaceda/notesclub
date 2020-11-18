# frozen_string_literal: true

APISchemas["v1/notes.yaml"][:notes_array] = {
  description: "Array of Notes",
  type: "array",
  items: { "$ref": "#/components/schemas/note" }
}
