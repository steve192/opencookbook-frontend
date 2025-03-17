// / <reference types="cypress" />

describe('Login form', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('login page shown', () => {
    cy.location('pathname').should('equal', '/');
    cy.percySnapshot();
  });

  it('password reset form', () => {
    cy.get('[data-testid="forgotPassword"]').click();
    cy.get('[data-testid="password-reset-title"]').should('exist');
    cy.percySnapshot();
  });

  it('register form', () => {
    cy.get('[data-testid="SignUpButton"]').click();
    cy.get('[data-testid="signup-title"]').should('exist');
    cy.percySnapshot();
  });
});
