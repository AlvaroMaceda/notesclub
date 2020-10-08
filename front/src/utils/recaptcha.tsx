import React from 'react'
import ReCAPTCHA from "react-google-recaptcha"

export const recaptchaRef = React.createRef<ReCAPTCHA>()

const dev = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')
export const recaptchaEnabled = !dev || process.env.REACT_APP_NOTESCLUB_RECAPTCHA_KEY
