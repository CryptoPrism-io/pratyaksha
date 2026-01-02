import { Page, expect } from '@playwright/test';

export interface ViewportInfo {
  name: string;
  category: 'desktop' | 'tablet' | 'mobile';
  width: number;
  height: number;
}

export const VIEWPORT_BREAKPOINTS = {
  mobile: { max: 640 },
  tablet: { min: 641, max: 1024 },
  desktop: { min: 1025 },
};

export function getViewportCategory(width: number): 'desktop' | 'tablet' | 'mobile' {
  if (width <= VIEWPORT_BREAKPOINTS.mobile.max) return 'mobile';
  if (width <= VIEWPORT_BREAKPOINTS.tablet.max) return 'tablet';
  return 'desktop';
}

export async function takeResponsiveScreenshots(
  page: Page,
  testName: string,
  viewportInfo: ViewportInfo
): Promise<void> {
  const screenshotPath = `screenshots/${testName}-${viewportInfo.name}-${viewportInfo.width}x${viewportInfo.height}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
}

export async function checkResponsiveLayout(page: Page): Promise<{
  hasOverflow: boolean;
  hasHorizontalScroll: boolean;
  elementsOutOfView: string[];
}> {
  return await page.evaluate(() => {
    const body = document.body;
    const html = document.documentElement;

    const hasHorizontalScroll = body.scrollWidth > window.innerWidth;
    const hasOverflow = html.scrollWidth > html.clientWidth;

    const elementsOutOfView: string[] = [];
    const allElements = document.querySelectorAll('*');

    allElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.right > window.innerWidth || rect.left < 0) {
        const identifier = el.id || el.className || el.tagName;
        if (identifier && !elementsOutOfView.includes(identifier)) {
          elementsOutOfView.push(identifier.toString().slice(0, 50));
        }
      }
    });

    return { hasOverflow, hasHorizontalScroll, elementsOutOfView: elementsOutOfView.slice(0, 10) };
  });
}

export async function checkTouchTargets(page: Page): Promise<{
  smallTargets: Array<{ element: string; size: { width: number; height: number } }>;
  passed: boolean;
}> {
  const MIN_TOUCH_TARGET = 44; // Apple HIG minimum

  const result = await page.evaluate((minSize) => {
    const interactiveElements = document.querySelectorAll('button, a, input, [role="button"], [onclick]');
    const smallTargets: Array<{ element: string; size: { width: number; height: number } }> = [];

    interactiveElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width < minSize || rect.height < minSize) {
        smallTargets.push({
          element: el.tagName + (el.id ? `#${el.id}` : '') + (el.className ? `.${el.className.toString().split(' ')[0]}` : ''),
          size: { width: Math.round(rect.width), height: Math.round(rect.height) }
        });
      }
    });

    return smallTargets.slice(0, 20);
  }, MIN_TOUCH_TARGET);

  return {
    smallTargets: result,
    passed: result.length === 0
  };
}

export async function checkTextReadability(page: Page): Promise<{
  smallText: Array<{ element: string; fontSize: string }>;
  passed: boolean;
}> {
  const MIN_FONT_SIZE = 12; // Minimum readable size

  const result = await page.evaluate((minSize) => {
    const textElements = document.querySelectorAll('p, span, a, button, h1, h2, h3, h4, h5, h6, label, td, th');
    const smallText: Array<{ element: string; fontSize: string }> = [];

    textElements.forEach((el) => {
      const style = window.getComputedStyle(el);
      const fontSize = parseFloat(style.fontSize);
      if (fontSize < minSize && el.textContent?.trim()) {
        smallText.push({
          element: el.tagName + (el.id ? `#${el.id}` : ''),
          fontSize: style.fontSize
        });
      }
    });

    return smallText.slice(0, 20);
  }, MIN_FONT_SIZE);

  return {
    smallText: result,
    passed: result.length === 0
  };
}

export async function checkAccessibility(page: Page): Promise<{
  issues: string[];
  passed: boolean;
}> {
  const issues = await page.evaluate(() => {
    const problems: string[] = [];

    // Check images without alt text
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    if (imagesWithoutAlt.length > 0) {
      problems.push(`${imagesWithoutAlt.length} images without alt text`);
    }

    // Check buttons without accessible names
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn) => {
      if (!btn.textContent?.trim() && !btn.getAttribute('aria-label')) {
        problems.push('Button without accessible name found');
      }
    });

    // Check form inputs without labels
    const inputs = document.querySelectorAll('input:not([type="hidden"])');
    inputs.forEach((input) => {
      const id = input.id;
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      const hasAriaLabel = input.getAttribute('aria-label');
      if (!hasLabel && !hasAriaLabel) {
        problems.push(`Input without label: ${input.type || 'text'}`);
      }
    });

    // Check color contrast (basic check)
    const headings = document.querySelectorAll('h1, h2, h3');
    headings.forEach((h) => {
      const style = window.getComputedStyle(h);
      if (style.color === style.backgroundColor) {
        problems.push('Heading with same foreground/background color');
      }
    });

    return problems.slice(0, 20);
  });

  return {
    issues,
    passed: issues.length === 0
  };
}
