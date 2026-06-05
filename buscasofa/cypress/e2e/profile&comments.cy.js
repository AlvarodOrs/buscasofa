describe('Perfil - funcionalidad completa', () => {
    let user;
    let updatedUser;
    before(() => {
        user = {
            username: `testuser${Date.now()}`,
            email: `test${Date.now()}@mail.com`,
            password: 'Test1234!'
        };
        updatedUser = {
            username: `updated_${Date.now()}`,
            email: `updated_${Date.now()}@mail.com`,
            password: 'Updated_Test1234!'
        };
        cy.signUp(user);
        cy.signIn(user.username, user.password);
    });
    it('El usuario ve una gasolinera y la valora', () => {
        cy.visit('/lista');
        cy.contains('Cargando...', {timeout: 5000});
        cy.contains('Cargando...', {timeout: 10000}).should('not.exist');
        cy.get('tbody tr')
          .its('length')
          .then((len) => {
            const index = Math.floor(Math.random() * len);
            cy.get('tbody tr')
              .eq(index)
              .contains('Ver detalle')
              .then(($a) => {
                const href = $a.attr('href');
                const stationId = href.split('/station/')[1];
                Cypress.env('stationId', stationId);
                cy.wrap($a).click();
              })
            });

        cy.contains(/Detalles/i, { timeout: 5000}).should('exist');
        const _text = Date.now();
        Cypress.env('_text', _text);
        cy.get('input[value="4"]')
        .should('exist')
        .check({ force: true });

        cy.get('textarea')
        .should('be.visible')
        .type(String(_text));

        cy.get('button[type="submit"]')
        .click();

        cy.contains(/enviado|comentario enviado|success/i, { timeout: 5000 })
        .should('exist');
    });

  it('El usuario ve su comentario en el perfil', () => {
    cy.signIn(user.username, user.password);
    const _text = Cypress.env('_text');
    cy.visit('/perfil');

    cy.get('.comments-list')
      .should('be.visible')
      .within(() => {
        cy.contains(`${_text}`).should('exist');
      });
  });

  it('El usuario edita su nombre de usuario', () => {
    cy.signIn(user.username, user.password);
    cy.visit('/perfil').contains('Perfil', { timeout: 5000 });

    cy.get('button').contains("✏️").click();
    cy.get('.edit select').select('username');

    cy.get('.edit input').first().clear().type(updatedUser.username);
    cy.get('.edit input').last().type(user.password);
    cy.get('button.btn-primary').click();
    cy.contains(`${updatedUser.username}`);
    cy.logout();

    cy.signIn(updatedUser.username, user.password);
  });

  it('El usuario edita su email', () => {
    cy.signIn(updatedUser.username, user.password);
    cy.visit('/perfil').contains('Perfil', { timeout: 5000 });

    cy.get('button').contains("✏️").click();
    cy.get('.edit select').select('email');

    cy.get('.edit input').first().clear().type(updatedUser.email);
    cy.get('.edit input').last().type(user.password);
    cy.get('button.btn-primary').click();
    cy.contains(`${updatedUser.email}`);
    cy.logout();

    cy.signIn(updatedUser.email, user.password);
  });

  it('El usuario edita su contraseña', () => {
    cy.signIn(updatedUser.email, user.password);
    cy.visit('/perfil').contains('Perfil', { timeout: 5000 });

    cy.get('button').contains("✏️").click();
    cy.get('.edit select').select('password');

    cy.get('.edit input').first().clear().type(updatedUser.password);
    cy.get('.edit input').last().type(user.password);
    cy.get('button.btn-primary').click();
    cy.wait(1000);
    cy.logout();
    
    cy.signIn(updatedUser.username, updatedUser.password);
  });

});