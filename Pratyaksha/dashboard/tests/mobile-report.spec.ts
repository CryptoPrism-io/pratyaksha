import { test, devices } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import {
  checkResponsiveLayout,
  checkTouchTargets,
  checkTextReadability,
} from './helpers/viewport-utils';

const mobileDevices = [
  { name: 'iphone14', device: 'iPhone 14', width: 390, height: 844 },
  { name: 'iphone14promax', device: 'iPhone 14 Pro Max', width: 430, height: 932 },
  { name: 'iphonese', device: 'iPhone SE', width: 375, height: 667 },
  { name: 'pixel7', device: 'Pixel 7', width: 412, height: 915 },
  { name: 'galaxys23', device: 'Galaxy S23', width: 360, height: 780 }
];

const testPages = [
  { name: 'landing', path: '/' },
  { name: 'dashboard', path: '/dashboard' },
  { name: 'logs', path: '/logs' }
];

const outputDir = 'test-results/mobile-report';
const testResults: any[] = [];

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

for (const deviceConfig of mobileDevices) {
  for (const pageConfig of testPages) {
    test(`${pageConfig.name} on ${deviceConfig.name}`, async ({ browser }) => {
      const context = await browser.newContext({
        ...devices[deviceConfig.device],
        viewport: { width: deviceConfig.width, height: deviceConfig.height }
      });
      
      const page = await context.newPage();
      
      console.log(`Testing ${pageConfig.name} on ${deviceConfig.name} (${deviceConfig.width}x${deviceConfig.height})...`);
      
      await page.goto(`http://localhost:5173${pageConfig.path}`);
      await page.waitForTimeout(2000);
      
      const screenshotName = `${pageConfig.name}-${deviceConfig.name}-${deviceConfig.width}x${deviceConfig.height}-2026-01-08.png`;
      await page.screenshot({ 
        path: path.join(outputDir, screenshotName),
        fullPage: true 
      });
      
      const touchCheck = await checkTouchTargets(page);
      const textCheck = await checkTextReadability(page);
      const layoutCheck = await checkResponsiveLayout(page);
      
      const result = {
        device: deviceConfig.name,
        deviceSize: `${deviceConfig.width}x${deviceConfig.height}`,
        page: pageConfig.name,
        screenshot: screenshotName,
        touchTargets: touchCheck.smallTargets,
        touchTargetsPassed: touchCheck.passed,
        smallText: textCheck.smallText,
        textReadabilityPassed: textCheck.passed,
        overflow: {
          hasOverflow: layoutCheck.hasHorizontalScroll,
          elementsOutOfView: layoutCheck.elementsOutOfView
        }
      };
      
      testResults.push(result);
      
      fs.writeFileSync(
        path.join(outputDir, 'test-results.json'),
        JSON.stringify(testResults, null, 2)
      );
      
      console.log(`  - Screenshot: ${screenshotName}`);
      console.log(`  - Touch targets: ${touchCheck.passed ? 'PASS' : 'FAIL'} (${touchCheck.smallTargets.length} issues)`);
      console.log(`  - Text readability: ${textCheck.passed ? 'PASS' : 'FAIL'} (${textCheck.smallText.length} issues)`);
      console.log(`  - Horizontal overflow: ${layoutCheck.hasHorizontalScroll ? 'FAIL' : 'PASS'}`);
      
      await context.close();
    });
  }
}
