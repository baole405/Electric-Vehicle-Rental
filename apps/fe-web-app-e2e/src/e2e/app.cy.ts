import { getGreeting } from '../support/app.po';

describe('@fe-web-app/fe-web-app-e2e', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should render the marketing hero heading', () => {
    getGreeting().should('contain.text', 'Rent electric vehicles with real-time fleet intelligence');
  });
});
