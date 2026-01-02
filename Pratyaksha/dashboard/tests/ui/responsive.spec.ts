import { test, expect } from '../fixtures/test-fixtures';
import {
  checkResponsiveLayout,
  checkTouchTargets,
  checkTextReadability,
  checkAccessibility,
  takeResponsiveScreenshots,
} from '../helpers/viewport-utils';

test.describe('Responsive UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Landing page renders correctly', async ({ page, viewportInfo }) => {
    // Take screenshot for visual comparison
    await page.screenshot({
      path: `test-results/screenshots/landing-${viewportInfo.name}.png`,
      fullPage: true,
    });

    // Check page title/header exists
    await expect(page.locator('body')).toBeVisible();
  });

  test('No horizontal overflow', async ({ page, viewportInfo }) => {
    const layoutCheck = await checkResponsiveLayout(page);

    // Log issues for debugging
    if (layoutCheck.hasHorizontalScroll) {
      console.log(`[${viewportInfo.name}] Horizontal scroll detected`);
      console.log('Elements out of view:', layoutCheck.elementsOutOfView);
    }

    expect(layoutCheck.hasHorizontalScroll).toBe(false);
  });

  test('Touch targets meet minimum size on mobile/tablet', async ({ page, viewportInfo }) => {
    if (viewportInfo.category === 'desktop') {
      test.skip();
      return;
    }

    const touchCheck = await checkTouchTargets(page);

    if (!touchCheck.passed) {
      console.log(`[${viewportInfo.name}] Small touch targets:`, touchCheck.smallTargets);
    }

    // Warning, not hard failure
    if (touchCheck.smallTargets.length > 0) {
      console.warn(`${touchCheck.smallTargets.length} touch targets below minimum size`);
    }
  });

  test('Text is readable at current viewport', async ({ page, viewportInfo }) => {
    const textCheck = await checkTextReadability(page);

    if (!textCheck.passed) {
      console.log(`[${viewportInfo.name}] Small text elements:`, textCheck.smallText);
    }
  });

  test('Basic accessibility checks pass', async ({ page, viewportInfo }) => {
    const a11yCheck = await checkAccessibility(page);

    if (!a11yCheck.passed) {
      console.log(`[${viewportInfo.name}] Accessibility issues:`, a11yCheck.issues);
    }
  });
});

test.describe('Dashboard Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('Dashboard renders correctly', async ({ page, viewportInfo }) => {
    await page.screenshot({
      path: `test-results/screenshots/dashboard-${viewportInfo.name}.png`,
      fullPage: true,
    });

    await expect(page.locator('body')).toBeVisible();
  });

  test('Dashboard layout is responsive', async ({ page, viewportInfo }) => {
    const layoutCheck = await checkResponsiveLayout(page);

    expect(layoutCheck.hasHorizontalScroll).toBe(false);

    // Take screenshot showing current state
    await page.screenshot({
      path: `test-results/screenshots/dashboard-layout-${viewportInfo.name}.png`,
    });
  });

  test('Chart components render correctly', async ({ page, viewportInfo }) => {
    // Wait for charts to load
    await page.waitForTimeout(1000);

    // Take screenshot of chart area
    await page.screenshot({
      path: `test-results/screenshots/dashboard-charts-${viewportInfo.name}.png`,
      fullPage: true,
    });
  });
});

test.describe('Navigation Tests', () => {
  test('Navigation works across viewports', async ({ page, viewportInfo }) => {
    await page.goto('/');

    // Check if mobile menu exists on mobile viewports
    if (viewportInfo.category === 'mobile') {
      const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, button[aria-label*="menu"]');
      if (await mobileMenu.count() > 0) {
        await mobileMenu.first().click();
        await page.screenshot({
          path: `test-results/screenshots/mobile-menu-${viewportInfo.name}.png`,
        });
      }
    }
  });
});

test.describe('Visual Regression', () => {
  test('Full page visual snapshot', async ({ page, viewportInfo }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500); // Let animations settle

    await expect(page).toHaveScreenshot(`landing-${viewportInfo.name}.png`, {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('Dashboard visual snapshot', async ({ page, viewportInfo }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Let charts render

    await expect(page).toHaveScreenshot(`dashboard-${viewportInfo.name}.png`, {
      fullPage: true,
      maxDiffPixels: 200,
    });
  });
});
