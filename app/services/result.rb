# frozen_string_literal: true

class Result
  class << self
    def ok(value = nil)
      self.new success: true, value: value.clone, errors: nil
    end

    def error(errors = nil)
      self.new success: false, value: nil, errors: errors.clone
    end
  end

  attr_reader :value, :errors

  def success?
    @success
  end

  def error?
    !@success
  end

  private
    class << self
      protected :new
    end

    def initialize(**values)
      @success = !!values[:success]
      @value = values[:value]
      @errors = values[:errors]
    end
end
