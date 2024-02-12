// / <reference types="cypress" />
// Welcome to Cypress!
//
// This spec file contains a variety of sample tests
// for a todo list app that are designed to demonstrate
// the power of writing tests in Cypress.
//
// To learn more about how Cypress works and
// what makes it such an awesome testing tool,
// please read our getting started guide:
// https://on.cypress.io/introduction-to-cypress

describe('Login form', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('login page shown', () => {
    cy.location('pathname').should('equal', '/LoginScreen');
    cy.percySnapshot();
  });
});
