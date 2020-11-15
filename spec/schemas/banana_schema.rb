# frozen_string_literal: true

APISchemas["v1/notes.yaml"][:banana] = {
  description: "User data",
  additionalProperties: false,
  properties: {
    # allOf: [{ "$ref": "/component/schema/user" }],
    banana: { type: "string" }
  },
  required: %w[banana]
}


