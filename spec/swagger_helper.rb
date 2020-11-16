# frozen_string_literal: true

require "rails_helper"

def add_schema(item, document, schema)
  schema_definition = APISchemas[document][schema]
  item[document][:components][:schemas].merge!({ schema => schema_definition})
end

RSpec.configure do |config|
  # Specify a root folder where Swagger JSON files are generated
  # NOTE: If you're using the rswag-api to serve API descriptions, you'll need
  # to ensure that it's configured to serve Swagger from the same folder
  # config.swagger_root = Rails.root.join("swagger").to_s
  config.swagger_root = Rails.root.join("docs", "API").to_s

  # Define one or more Swagger documents and provide global metadata for each one
  # When you run the 'rswag:specs:swaggerize' rake task, the complete Swagger will
  # be generated at the provided relative path under swagger_root
  # By default, the operations defined in spec files are added to the first
  # document below. You can override this behavior by adding a swagger_doc tag to the
  # the root example_group in your specs, e.g. describe '...', swagger_doc: 'v2/swagger.json'
  config.swagger_docs = {
    "v1/notes.yaml" => {
      openapi: "3.0.1",
      info: {
        title: "API V1",
        version: "v1"
      },
      paths: {},
      servers: [
        {
          url: "https://{defaultHost}",
          variables: {
            defaultHost: {
              default: "www.example.com"
            }
          }
        }
      ], # servers
      components: {
        schemas: {
          # This key must exist. All schemas will be merged here for each document
        }
      } # components
    } # v1/notes.yaml
  } # swagger_docs

  Dir[Rails.root.join("spec/schemas/**/*.rb")].each { |f| require f }

  # If orden is not relevant, we could move this inside each scheam definition file
  add_schema config.swagger_docs, "v1/notes.yaml", :rfc7807
  add_schema config.swagger_docs, "v1/notes.yaml", :note_basic
  add_schema config.swagger_docs, "v1/notes.yaml", :user
  add_schema config.swagger_docs, "v1/notes.yaml", :note_descendants
  add_schema config.swagger_docs, "v1/notes.yaml", :note

  # Specify the format of the output Swagger file when running 'rswag:specs:swaggerize'.
  # The swagger_docs configuration option has the filename including format in
  # the key, this may want to be changed to avoid putting yaml in json files.
  # Defaults to json. Accepts ':json' and ':yaml'.
  config.swagger_format = :yaml
end
