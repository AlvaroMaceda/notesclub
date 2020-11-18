# frozen_string_literal: true

class APISchemas
  @schemas = {
    # Initialize here the different documents to an empty hash
    "v1/notes.yaml" => {}
  }

  class << self
    attr_accessor :schemas

    def [](key)
      schemas[key]
    end

    def []=(key, value)
      schemas[key] = value
    end

    def configure(swagger_docs)
      # We are assuming definition order is not relevant
      @schemas.each_key do |document|
        add_document swagger_docs, document
      end
    end

    private
      def add_document(swagger_docs, document)
        @schemas[document].each_key do |schema|
          add_schema(swagger_docs, document, schema)
        end
      end
      def add_schema(swagger_docs, document, schema)
        schema_definition = @schemas[document][schema]
        swagger_docs[document][:components][:schemas].merge!({ schema => schema_definition })
      end
  end
end
