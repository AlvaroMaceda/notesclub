# frozen_string_literal: true

APISchemas["v1/notes.yaml"][:banana1] = {
  description: "Banana1",
  # additionalProperties: false,
  properties: {
    banana_1: { type: "integer" }
  },
  required: %w[banana_1]
}
