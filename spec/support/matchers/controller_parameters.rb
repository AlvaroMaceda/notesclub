# frozen_string_literal: true

RSpec::Matchers.define :controller_parameters do |expected|
  match do |actual|
    expected == actual.except("format", "controller", "action").as_json
  end

  description do |banana|
    "ActionController::Parameters with #{expected}"
  end
end
