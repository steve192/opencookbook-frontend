/// <reference types="cypress" />

// Exercises RecipeImageViewPager (web build via the ViewPager.tsx Swiper variant).
// Specifically: index indicator, conditional forward/back buttons, and clamping
// behavior when there are 0 or 1 images.

const recipeWithImages = (numImages) => ({
  id: 999,
  type: 'Recipe',
  title: 'Slider test recipe',
  servings: 1,
  preparationSteps: ['Step 1'],
  neededIngredients: [],
  recipeGroups: [],
  images: Array.from({length: numImages}, (_, i) => ({
    uuid: `slider-img-${i}`,
    createdOn: '2023-10-02T13:05:54.567797Z',
    lastChange: '2023-10-02T13:05:54.567797Z',
  })),
});

const setupRoutes = (numImages) => {
  cy.fixture('users-login.json').then((data) => {
    cy.intercept('POST', '/api/v1/users/login', {statusCode: 200, body: data});
  });
  cy.fixture('users-self.json').then((data) => {
    cy.intercept('GET', '/api/v1/users/self', {statusCode: 200, body: data});
  });
  cy.intercept('GET', '/api/v1/recipes', {statusCode: 200, body: [recipeWithImages(numImages)]});
  cy.intercept('GET', '/api/v1/recipe-groups', {statusCode: 200, body: []});
  cy.intercept('GET', '/api/v1/recipes/999', {statusCode: 200, body: recipeWithImages(numImages)});
  cy.intercept('GET', '/api/v1/recipes-images/**', {fixture: 'recipes-images-image.jpg'});
};


describe('RecipeImageViewPager', () => {
  it('hides nav buttons and indicator when there are no images', () => {
    setupRoutes(0);
    cy.visit('/recipe?recipeId=999');

    cy.get('[data-testid="recipe-image-viewpager"]').should('exist');
    cy.get('[data-testid="recipe-image-viewpager-forward"]').should('not.exist');
    cy.get('[data-testid="recipe-image-viewpager-back"]').should('not.exist');
    cy.get('[data-testid="recipe-image-viewpager-indicator"]').should('not.exist');
  });

  it('hides both nav buttons when there is exactly one image', () => {
    setupRoutes(1);
    cy.visit('/recipe?recipeId=999');

    cy.get('[data-testid="recipe-image-viewpager-indicator"]').should('contain', '1 / 1');
    cy.get('[data-testid="recipe-image-viewpager-forward"]').should('not.exist');
    cy.get('[data-testid="recipe-image-viewpager-back"]').should('not.exist');
  });

  it('paginates forward and back through multiple images', () => {
    setupRoutes(3);
    cy.visit('/recipe?recipeId=999');

    cy.get('[data-testid="recipe-image-viewpager-indicator"]').should('contain', '1 / 3');
    cy.get('[data-testid="recipe-image-viewpager-back"]').should('not.exist');
    cy.get('[data-testid="recipe-image-viewpager-forward"]').should('exist').click();

    cy.get('[data-testid="recipe-image-viewpager-indicator"]').should('contain', '2 / 3');
    cy.get('[data-testid="recipe-image-viewpager-back"]').should('exist');
    cy.get('[data-testid="recipe-image-viewpager-forward"]').should('exist').click();

    cy.get('[data-testid="recipe-image-viewpager-indicator"]').should('contain', '3 / 3');
    cy.get('[data-testid="recipe-image-viewpager-forward"]').should('not.exist');

    cy.get('[data-testid="recipe-image-viewpager-back"]').click();
    cy.get('[data-testid="recipe-image-viewpager-indicator"]').should('contain', '2 / 3');
  });
});
