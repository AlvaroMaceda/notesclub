# frozen_string_literal: true

APISchemas["v1/notes.yaml"][:note_descendants] = {
  description: "Descendants notes of a note",
  additionalProperties: false,
  type: "array",
  items: { "$ref": "#/components/schemas/note_basic" }

  # This works
  # items: {
  #   type: "object",
  #   properties: {
  #     id: { type: :string }
  #   },
  #   required: %w[id]
  # }


}
