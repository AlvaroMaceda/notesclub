# frozen_string_literal: true

APISchemas["v1/notes.yaml"][:banana2] = {
  description: "Banana2",
  # additionalProperties: false,
  properties: {
    banana_2: { type: "integer" },
    optional: { type: "integer" },
  },
  required: %w[banana_2]
}
