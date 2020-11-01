# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  default from: "Book Notes Club <book@notes.club>"
  layout "mailer"
end
