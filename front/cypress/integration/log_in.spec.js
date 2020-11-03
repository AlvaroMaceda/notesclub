import { makeUserResponse } from '../support/helpers.js'

describe('Sign up', () => {

  beforeEach(() => {
    cy.fixture('users/mariecurie').as('marie_curie')
  })

  it('should introduce code and log in', function() {

    cy.server()
    cy.route({
      method: 'POST',
      url: '/v1/users/login',
      response: { user: makeUserResponse(this.marie_curie) },
      status: 200
    })
    cy.route({
      method: 'GET',
      url: '/v1/users/me',
      response: makeUserResponse(this.marie_curie),
      status: 200
    })

    cy.visit('/login')

    cy.get('input[name="email"]')
      .type(this.marie_curie.email)
    cy.get('input[name="password"]')
      .type(this.marie_curie.password)

    cy.get('form').within(() => {
      cy.get('button').click()
    })


    cy.location('pathname').should('eq', '/')
    cy.get('nav').within(() => {
      cy.contains('Marie Curie')
      cy.contains('Logout')
    })
  })
})
