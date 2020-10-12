import { parameterize } from '../../src/utils/parameterize'

describe('Sign up', () => {
  it('should introduce code and log in', () => {
    const user = {
      id: 1,
      name: "Marie Curie",
      username: "curie"
    }
    cy.server()
    cy.route({
      method: 'GET',
      url: '/v1/users/me',
      response: user,
      status: 200
    })


    cy.visit('/books/new')
    cy.route({
      method: 'GET',
      url: 'https://openlibrary.org/*',
      response: {
        docs: [
          {
            title_suggest: "Sapiens",
            author_name: 'Yuval Noah Harari'
          },
          {
            title_suggest: "Don Quijote",
            author_name: 'Miguel de Cervantes'
          }
        ]
      },
      status: 200
    })

    cy.get('input')
      .type('Sapiens')

    cy.contains('Sapiens by Yuval Noah Harari').click()

    cy.route({
      method: 'GET',
      url: '/v1/users?username=curie',
      response: [user],
      status: 200
    })

    cy.route({
      method: 'GET',
      url: '/v1/notes*',
      response: [],
      status: 200
    })

    cy.route({
      method: 'POST',
      url: '/v1/notes',
      response: [],
      status: 200
    })

    cy.get('form').within(() => {
      cy.get('button').click()
    })

    const noteTitle = 'Sapiens (book) by Yuval Noah Harari'
    cy.location('pathname').should('eq', `/${user.username}/${parameterize(noteTitle)}`)
  })
})
