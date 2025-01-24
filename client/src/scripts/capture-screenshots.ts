const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function captureScreenshots() {
  console.log('Starting screenshot capture...');
  
  // Launch browser
  const browser = await chromium.launch({
    headless: false // Set to true for production
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const screenshotsDir = path.join(__dirname, '../../docs/images');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    console.log('Navigating to app...');
    // Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    console.log('Capturing Categories View...');
    // Capture Categories View
    await page.waitForSelector('table');
    await page.screenshot({
      path: path.join(screenshotsDir, 'categories-view.png'),
      fullPage: true
    });

    console.log('Capturing Category Dialog...');
    // Open Category Dialog
    await page.click('button:has-text("Add Category")');
    await page.waitForSelector('div[role="dialog"]');
    await page.screenshot({
      path: path.join(screenshotsDir, 'category-dialog.png'),
    });
    await page.click('button:has-text("Cancel")');

    console.log('Capturing Products View...');
    // View Products
    await page.click('button:has-text("View Products")');
    await page.waitForSelector('table');
    // Wait a bit for animations
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotsDir, 'products-view.png'),
      fullPage: true
    });

    console.log('Capturing Product Dialog...');
    // Open Product Dialog
    await page.click('button:has-text("Add Product")');
    await page.waitForSelector('div[role="dialog"]');
    // Wait a bit for animations
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotsDir, 'product-dialog.png'),
    });

    console.log('Screenshots captured successfully!');
  } catch (error) {
    console.error('Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

// Make it a module by exporting something
export { captureScreenshots };

// Run the function
if (require.main === module) {
  captureScreenshots();
}
