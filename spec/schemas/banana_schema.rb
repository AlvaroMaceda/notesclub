# frozen_string_literal: true

APISchemas["v1/notes.yaml"][:banana] = {
  description: "User data",
  # additionalProperties: false,
  properties: {
    banana: { type: "string" }
  },
  required: %w[banana]
}
