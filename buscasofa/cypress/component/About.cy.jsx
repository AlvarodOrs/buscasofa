import React from 'react'
import About from '../../src/components/About'

const members = ["Álvaro d\'Ors Nestares", "Álvaro Marcos Miguel", "Fabian Arana Machuca", "Jaime García Cabanillas", "Roberto García Suárez"]
const hasDone = ["ha hecho", "se ha encargado de", "realizó", "se ocupó", "finalizó"];

describe('Visualización del about de la aplicación', () => {
  it(`La página contiene todos los miembros del equipo: ${members.join(', ')}`, () => {
    cy.mount(<About />)
    members.forEach(member => {
      cy.get('#description').contains(member).should('be.visible');
    });
  });

  it('El usuario ve la descripción del trabajo de cada miembro', () => {
    cy.mount(<About />)
    members.forEach(member => {
      const regex = new RegExp(
        `${member}.*(${hasDone.join('|')})`
      );
      cy.get('#description').contains(regex).should('be.visible');
    });
  });
  it('El usuario ve el número del grupo', () => {
    cy.mount(<About />)
      .get('#info')
      .should('contain', 'Somos el equipo nº')
      .contains(/[1-30]/);
  });
})