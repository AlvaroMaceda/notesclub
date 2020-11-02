import * as React from 'react'

interface PrivacyProps {
}

interface PrivacyState {
}

class Privacy extends React.Component<PrivacyProps, PrivacyState> {
  constructor(props: PrivacyProps) {
    super(props)

    this.state = {
    }
  }

  componentDidMount() {
  }

  public render() {
    return (
      <div className="container">
        <h1>Privacy Policy</h1>
        <p>Last updated: 24/9/2020</p>
        <p>Notes Club ("us", "we", or "our") operates http://notes.club (the "Site"). This page informs you of our policies regarding the collection, use and disclosure of Personal Information we receive from users of the Site.</p>
        <p>We use your Personal Information only for providing and improving the Site. By using the Site, you agree to the collection and use of information in accordance with this policy.</p>

        <p><b>Information Collection And Use</b></p>
        <p>While using our Site, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. Personally identifiable information may include, but is not limited to your name ("Personal Information").</p>
        <p><b>Log Data</b></p>
        <p>Like many site operators, we collect information that your browser sends whenever you visit our Site ("Log Data").</p>
        <p>This Log Data may include information such as your computer's Internet Protocol ("IP") address, browser type, browser version, the pages of our Site that you visit, the time and date of your visit, the time spent on those pages and other statistics.</p>
        <p>In addition, we may use third party services such as Google Analytics that collect, monitor and analyze this data.</p>

        <p><b>Communications</b></p>
        <p>We may use your Personal Information to contact you with newsletters, marketing or promotional materials and other information that is relevant to you.</p>

        <p><b>Cookies</b></p>
        <p>Cookies are files with small amount of data, which may include an anonymous unique identifier. Cookies are sent to your browser from a web site and stored on your computer's hard drive.</p>
        <p>Like many sites, we use "cookies" to collect information, use Google Analytics and to know if you are logged in our site. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Site.</p>

        <p><b>Security</b></p>
        <p>The security of your Personal Information is important to us, but remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.</p>

        <p><b>Changes To This Privacy Policy</b></p>
        <p>This Privacy Policy is effective as of (add date) and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this</p>
        page.
        <p>We reserve the right to update or change our Privacy Policy at any time and you should check this Privacy Policy periodically. Your continued use of the Service after we post any modifications to the Privacy Policy on this page will constitute your acknowledgment of the modifications and your consent to abide and be bound by the modified Privacy Policy.</p>
        <p>If we make any material changes to this Privacy Policy, we will notify you either through the email address you have provided us, or by placing a prominent notice on our website.</p>

        <p><b>Contact Us</b></p>
        <p>If you have any questions about this Privacy Policy, please contact us: book@notes.club</p>
      </div>
    )
  }
}

export default Privacy
