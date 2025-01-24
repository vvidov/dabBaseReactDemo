const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function captureScreenshots() {
  console.log('Starting screenshot capture...');
  
  // Use absolute paths - go up one more level to reach root
  const projectRoot = path.resolve(__dirname, '../../../');
  const screenshotsDir = path.join(projectRoot, 'docs', 'images');
  
  console.log('Screenshots will be saved to:', screenshotsDir);
  
  // Ensure directory exists
  if (!fs.existsSync(screenshotsDir)) {
    console.log('Creating screenshots directory...');
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Launch browser
  const browser = await chromium.launch({
    headless: false // Set to true for production
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    console.log('Navigating to app...');
    // Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Capture Categories View
    console.log('Capturing Categories View...');
    const categoriesPath = path.join(screenshotsDir, 'categories-view.png');
    await page.waitForSelector('table');
    await page.screenshot({
      path: categoriesPath,
      fullPage: true
    });
    console.log('Saved Categories View to:', categoriesPath);

    // Open Category Dialog
    console.log('Capturing Category Dialog...');
    const categoryDialogPath = path.join(screenshotsDir, 'category-dialog.png');
    await page.click('button:has-text("Add Category")');
    await page.waitForSelector('div[role="dialog"]');
    await page.waitForTimeout(1000); // Wait for animation
    await page.screenshot({
      path: categoryDialogPath
    });
    console.log('Saved Category Dialog to:', categoryDialogPath);
    await page.click('button:has-text("Cancel")');

    // View Products
    console.log('Capturing Products View...');
    const productsPath = path.join(screenshotsDir, 'products-view.png');
    await page.click('button:has-text("View Products")');
    await page.waitForSelector('table');
    await page.waitForTimeout(1000); // Wait for animation
    await page.screenshot({
      path: productsPath,
      fullPage: true
    });
    console.log('Saved Products View to:', productsPath);

    // Open Product Dialog
    console.log('Capturing Product Dialog...');
    const productDialogPath = path.join(screenshotsDir, 'product-dialog.png');
    await page.click('button:has-text("Add Product")');
    await page.waitForSelector('div[role="dialog"]');
    await page.waitForTimeout(1000); // Wait for animation
    await page.screenshot({
      path: productDialogPath
    });
    console.log('Saved Product Dialog to:', productDialogPath);

    // Verify all files were created
    const files = [
      'categories-view.png',
      'category-dialog.png',
      'products-view.png',
      'product-dialog.png'
    ];
    
    const missingFiles = files.filter(file => 
      !fs.existsSync(path.join(screenshotsDir, file))
    );
    
    if (missingFiles.length > 0) {
      throw new Error(`Failed to create screenshots: ${missingFiles.join(', ')}`);
    }

    console.log('All screenshots captured successfully!');
    
  } catch (error) {
    console.error('Error capturing screenshots:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Make it a module by exporting something
export { captureScreenshots };

// Run the function
if (require.main === module) {
  captureScreenshots().catch(error => {
    console.error('Screenshot capture failed:', error);
    process.exit(1);
  });
}
