// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('signUp', (user) => {
    cy.visit('/registro').contains(/Registro/, { timeout: 5000}).should('exist');
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="email"]').type(user.email);
    cy.get('input[name="password"]').type(user.password);
    cy.get('form').submit();
    cy.contains(/Usuario registrado correctamente/i, { timeout: 5000 }).should('exist');
});

Cypress.Commands.add('signIn', (identifier, password) => {
    cy.visit('/login').contains(/Iniciar sesión/i, { timeout: 5000}).should('exist');
    cy.get('input[name="email"]').type(identifier);
    cy.get('input[name="password"]').type(password);
    cy.get('form').submit();
    cy.contains(/¡Bienvenido,|login correcto|Perfil/i, { timeout: 5000 }).should('exist');
})

Cypress.Commands.add('logout', () => {
    cy.get('button').contains('Cerrar sesión').click();
    cy.on('window:confirm', () => true);
})