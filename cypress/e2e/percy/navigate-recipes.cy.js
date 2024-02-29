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

describe('Recipe navigation', () => {
  beforeEach(() => {
    cy.visit('/');

    cy.fixture('users-login.json').then((data) => {
      cy.intercept('POST', '/api/v1/users/login', {
        statusCode: 200,
        body: data,
      });
    });

    cy.fixture('users-self.json').then((data) => {
      cy.intercept('GET', '/api/v1/users/self', {
        statusCode: 200,
        body: data,
      });
    });
    cy.fixture('recipes.json').then((data) => {
      cy.intercept('GET', '/api/v1/recipes', {
        statusCode: 200,
        body: data,
      });
    });
    cy.fixture('recipe-groups.json').then((data) => {
      cy.intercept('GET', '/api/v1/recipe-groups', {
        statusCode: 200,
        body: data,
      });
    });

    cy.fixture('recipes-1898.json').then((data) => {
      cy.intercept('GET', '/api/v1/recipes/1898', {
        statusCode: 200,
        body: data,
      });
    });

    cy.intercept('GET', '/api/v1/recipes-images/**', {fixture: 'recipes-images-image.jpg'});

    // cy.get('[data-testid="usernameInput"]').type('username');
    // cy.get('[data-testid="passwordInput"').type('password');
    // cy.get('[data-testid="loginButton"').click();
  });


  it('recipe list', () => {
    cy.visit('/myRecipes');
    cy.get('[data-testid="recipeListScreen"]').should('exist');
    cy.percySnapshot();
  });

  it('recipe from recipe group', () => {
    cy.visit('/myRecipes');
    cy.get('[data-testid="recipeGroupListItem"').first().click();

    cy.location('pathname').should('equal', '/myRecipes');
    cy.location('search').should('equal', '?shownRecipeGroupId=2210');

    cy.get('[data-testid="recipeListItem"]:visible').should('have.length', 1);

    cy.percySnapshot('recipe-group-screen');

    cy.get('[data-testid="recipeListItem"]:visible').click();

    cy.location('pathname').should('equal', '/recipe');
    cy.location('search').should('equal', '?recipeId=48');

    cy.get('[data-testid="recipe-prepsteps-title"]').should('exist');

    cy.percySnapshot('recipe-screen');

    cy.get('[data-testid="recipe-prepsteps-title"]').scrollIntoView();

    cy.percySnapshot('recipe-screen-bottom');
  });


  it('guided cooking', () => {
    cy.visit('/myRecipes');
    cy.get('[data-testid="recipeListItem"').eq(1).click();

    cy.get('[data-testid="guided-cooking-button"').click();
  });


  it('edit recipe', () => {
    cy.visit('/recipe?recipeId=1898');

    cy.get('[data-testid="ingredient-section-caption"]').should('exist');

    cy.get('[data-testid="recipe-edit-button"]').click();
    cy.get('[data-testid="ingredient-list-title"]').should('exist');
    cy.percySnapshot();
  });
});
