import { Page, Route } from '@playwright/test';

export class APIMocker {
  constructor(private page: Page) {}

  async mockSuccessfulAPI(endpoint: string, data: any) {
    await this.page.route(`**${endpoint}`, async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data)
      });
    });
  }

  async mockFailedAPI(endpoint: string, statusCode: number = 500) {
    await this.page.route(`**${endpoint}`, async (route: Route) => {
      await route.fulfill({
        status: statusCode,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'API Error' })
      });
    });
  }

  async mockSlowAPI(endpoint: string, data: any, delay: number = 2000) {
    await this.page.route(`**${endpoint}`, async (route: Route) => {
      await new Promise(resolve => setTimeout(resolve, delay));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data)
      });
    });
  }
}
