# frozen_string_literal: true

# How to use it:
# TestMailer.with(user: user).test_email.deliver_now
class TestMailer < ApplicationMailer
  def test_email
    @user = params[:user]
    mail(to: @user.email, subject: "Test email")
  end
end
