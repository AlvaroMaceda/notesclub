import React from 'react'
import { render } from '@testing-library/react'
import App from './../App'

describe('App', () => {
  test('renders Notes Club', () => {
    const { getByText } = render(<App />)
    const linkElement = getByText(/Notes Club/i)
    expect(linkElement).toBeInTheDocument()
    expect(linkElement.getAttribute("href")).toEqual("/")
  })
})
