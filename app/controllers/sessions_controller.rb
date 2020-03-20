class SessionsController < Devise::SessionsController
  skip_before_action :authenticate_user!

  def create
    user = User.find_by_email(sign_in_params[:email])
    if user && user.valid_password?(sign_in_params[:password])
      Rails.logger.info("action:user_login:#{user.id}")
      user.reset_jwt_token
      user.save!
      # session[:user_id] = 1
      # cookies.signed[:jwt] = {value: user.jwt_token, httponly: true}
      response.set_cookie(
        :jwt,
        {
          value: user.jwt_token,
          expires: 30.days.from_now,
          path: '/api',
          httponly: true
        }
      )
      @current_user = user
    else
      render json: { errors: { 'email or password' => ['is invalid'] }}, status: :unauthorized
    end
  end
end
