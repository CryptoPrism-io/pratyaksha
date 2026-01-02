import { test as base, expect } from '@playwright/test';
import { getViewportCategory, ViewportInfo } from '../helpers/viewport-utils';

// Extended test fixture with viewport info
export const test = base.extend<{
  viewportInfo: ViewportInfo;
}>({
  viewportInfo: async ({ page }, use) => {
    const viewport = page.viewportSize();
    const projectName = test.info().project.name;

    const info: ViewportInfo = {
      name: projectName,
      category: getViewportCategory(viewport?.width || 1920),
      width: viewport?.width || 1920,
      height: viewport?.height || 1080,
    };

    await use(info);
  },
});

export { expect };

// Test data for UI testing
export const TEST_PAGES = {
  home: '/',
  dashboard: '/dashboard',
};

// UX criteria weights
export const UX_CRITERIA = {
  touchTargetSize: { min: 44, weight: 0.2 },
  fontSize: { min: 12, weight: 0.15 },
  contrast: { min: 4.5, weight: 0.2 },
  responsiveness: { weight: 0.25 },
  accessibility: { weight: 0.2 },
};
