# frozen_string_literal: true

APISchemas["v1/notes.yaml"][:user] = {
  description: "User data",
  additionalProperties: false,
  properties: {
    id: {
      description: "User id",
      type: "integer"
    },
    name: {
      description: "Name of the user",
      type: "string",
      nullable: true
    },
    username: {
      description: "Username",
      type: "string"
    },
    avatar_url: {
      description: "URL of user's avatar",
      type: "string",
      format: "URI",
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
  },
  required: %w[id name username created_at updated_at]
}
