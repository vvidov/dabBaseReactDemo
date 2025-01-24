# Screenshot Capture Guide

This guide explains how to capture screenshots of the application for documentation purposes.

## Screenshot Locations

Screenshots are stored in the root `docs/images/` directory and include:
- `categories-view.png`: Main categories list with management options
- `category-dialog.png`: Category creation/edit dialog
- `products-view.png`: Products list within a category
- `product-dialog.png`: Product creation/edit dialog

## Capture Process

The `capture-screenshots.ts` script automates the screenshot capture process using Playwright. It:
1. Opens a browser window
2. Navigates through the application
3. Captures key views and dialogs
4. Saves them to the images directory

### Prerequisites

1. Install dependencies:
```bash
npm install -D playwright @types/node
npx playwright install chromium
```

2. Ensure the React app is running at http://localhost:3000

### Running the Script

```bash
cd client
npx ts-node src/scripts/capture-screenshots.ts
```

### Troubleshooting

If you encounter issues:
1. Make sure the app is running and accessible
2. Check that you have write permissions in the docs/images directory
3. Keep the browser window visible and not minimized during capture
4. Wait for the process to complete - it includes delays for animations

## Maintaining Screenshots

Update screenshots when:
- Making significant UI changes
- Adding new features
- Changing the layout or styling
- Updating the application workflow

This ensures the documentation stays current with the latest version of the application.
