describe('Sign up', () => {
  it('should introduce code and log in', () => {
    cy.visit('/signup')

    cy.get('input[name="name"]')
      .type('Hector Perez')
    cy.get('input[name="email"]')
      .type('book@notes.club')
    cy.get('input[name="username"]')
      .type('hector')
    cy.get('input[name="password"]')
      .type('n1s-E8zA@3')
    const user = {
      id: 1,
      name: "Hector Perez",
      username: "hector"
    }
    cy.server()
    cy.route({
      method: 'POST',
      url: '/v1/users',
      response: { user: user },
      status: 200
    })
    cy.route({
      method: 'GET',
      url: '/v1/users/me',
      response: user,
      status: 200
    })

    cy.route({
      method: 'GET',
      url: '/v1/users?username=help',
      response: [{
        id: 4,
        name: "Help",
        username: "help"
      }],
      status: 200
    })

    cy.route({
      method: 'GET',
      url: '/v1/notes*',
      response: [{
        ancestors: [],
        ancestry: null,
        content: "Welcome",
        created_at: "2020-09-26T10:06:12.855Z",
        descendants: [],
        id: 17,
        position: 1,
        slug: "welcome",
        updated_at: "2020-09-26T10:06:12.855Z",
        user: { id: 4, name: "Help", username: "help", },
        user_id: 4
      }],
      status: 200
    })
    cy.get('form').within(() => {
      cy.get('button').click()
    })
    cy.location('pathname').should('eq', '/help')
    cy.get('nav').within(() => {
      cy.contains('Hector Perez')
      cy.contains('Logout')
    })
  })
})
