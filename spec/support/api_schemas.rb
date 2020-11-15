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
  end
end

