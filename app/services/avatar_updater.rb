class AvatarUpdater
  def initialize(user)
    @user = user
  end

  def update
    new_url = "https://www.gravatar.com/avatar/#{email_md5}"
    user.update(avatar_url: new_url)
  end

  private

  attr_reader :user

  def email_md5
    return "00000000000000000000000000000000" if email.blank?

    Digest::MD5.hexdigest(email)
  end

  def email
    user.email.strip.downcase
  end
end
