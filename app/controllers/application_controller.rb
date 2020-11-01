# frozen_string_literal: true

class ApplicationController < ActionController::API
  include ::ActionController::Cookies
  before_action :authenticate_user!
  respond_to :json

  private
    def track_action(event, properties = {})
      if current_user.present? && ENV["NOTES_SEGMENT_ENABLED"].to_s == "true"
        Analytics.track(
          user_id: current_user.id.to_s,
          event: event,
          properties: properties.merge({ current_user_username: current_user.username }))
      end
    end

    def track_user
      if current_user.present? && ENV["NOTES_SEGMENT_ENABLED"].to_s == "true"
        Analytics.identify(
          user_id: current_user.id,
          traits: {
            name: current_user.name,
            username: current_user.username,
            email: current_user.email,
            created_at: current_user.created_at
          }
        )
      end
    end

    def current_user_id
      @current_user_id ||= authenticate
    end

    def authenticate
      jwt_payload = JWT.decode(jwt_token, Rails.application.secret_key_base).first
      id = jwt_payload["id"]
      Rails.logger.info "authenticate: id: #{id}"
      id
    rescue JWT::ExpiredSignature, JWT::VerificationError, JWT::DecodeError
      nil
    end

    def jwt_token
      @jwt_token ||= (cookies.signed[:jwt] || request.cookies["jwt"] || "")
    end

    def authenticate_user!(options = {})
      head :unauthorized unless signed_in?
    end

    def current_user
      @current_user ||= super || User.find_by(id: current_user_id)
    end

    def signed_in?
      current_user_id.present?
    end

    def log_in_as(user)
      user.reset_jwt_token
      user.save!
      cookies.signed[:jwt] = { value: user.jwt_token, httponly: true }
      # response.set_cookie(
      #   :jwt,
      #   {
      #     value: user.jwt_token,
      #     expires: 30.days.from_now,
      #     httponly: true,
      #   }
      # )
      @current_user = user
    end

    def verify_recaptcha_if_required(args = {})
      return true if (Rails.env.development? || Rails.env.test?) && ENV["NOTESCLUB_RECAPTCHA_SECRET"].blank?

      verify_recaptcha(args)
    end
end
