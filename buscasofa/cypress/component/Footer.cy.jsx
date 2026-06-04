import React from 'react'
import Footer from '../../src/components/Footer'

const members = ["Álvaro d\'Ors Nestares", "Álvaro Marcos Miguel", "Fabian Arana Machuca", "Jaime García Cabanillas", "Roberto García Suárez"]

describe('Visualización de los miembros en el footer de la aplicación', () => {
  it(`El Footer contiene todos los miembros del equipo: ${members.join(', ')}`, () => {
    cy.mount(<Footer />)
    members.forEach(member => {
      cy.get('.footer')
        .contains(member)
        .should('be.visible');
    });
  });
})